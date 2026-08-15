from ortools.sat.python import cp_model
from typing import List, Dict, Any, Tuple
from datetime import datetime, time, timedelta

# Priorities: 1 (High), 2 (Medium), 3 (Low)
PRIORITY_WEIGHTS = {
    1: 1000,
    2: 100,
    3: 10
}

def datetime_to_hours(dt: datetime, base_time: datetime) -> int:
    return int((dt - base_time).total_seconds() / 3600)

def resolve_booking_conflicts(
    equipment_id: int,
    existing_bookings: List[Dict[str, Any]],
    new_booking: Dict[str, Any],
    transport_buffer_hours: int
) -> Tuple[bool, List[int], str]:
    """
    Uses Google OR-Tools CP-SAT to resolve booking conflicts for a single piece of equipment.
    
    Returns:
        is_accepted (bool): Whether the new booking can be accommodated.
        displaced_ids (List[int]): IDs of existing approved bookings that must be displaced.
        message (str): Reason/Status string.
    """
    model = cp_model.CpModel()
    
    all_bookings = existing_bookings + [new_booking]
    
    if not all_bookings:
        return True, [], "Approved"
        
    base_time = min(b['start_date'] for b in all_bookings)
    
    presences = {}
    for b in all_bookings:
        b_id = b['id']
        presences[b_id] = model.NewBoolVar(f'presence_{b_id}')
        
    # Non-overlapping constraints with transport buffer
    for i, b1 in enumerate(all_bookings):
        for j, b2 in enumerate(all_bookings):
            if i >= j:
                continue
            buffer = 0 if b1['site_id'] == b2['site_id'] else transport_buffer_hours

            # If both bookings are single-day bookings on the same calendar day, use shift-aware checks
            def is_single_day(b):
                return b['start_date'].date() == b['end_date'].date()

            def shift_range(b):
                        sh = b.get('shift', 'full_day')
                        d = b['start_date'].date()
                        if sh == 'morning':
                            return datetime.combine(d, time(8, 0)), datetime.combine(d, time(12, 0))
                        if sh == 'afternoon':
                            return datetime.combine(d, time(13, 0)), datetime.combine(d, time(17, 0))
                        # full_day or unknown -> treat as occupying both shifts contiguous on single day
                        return datetime.combine(d, time(8, 0)), datetime.combine(d, time(17, 0))

            if is_single_day(b1) and is_single_day(b2) and b1['start_date'].date() == b2['start_date'].date():
                s1_dt, e1_dt = shift_range(b1)
                s2_dt, e2_dt = shift_range(b2)

                # Apply transport buffer as hours between end and start
                if not (e1_dt + timedelta(hours=buffer) <= s2_dt or e2_dt + timedelta(hours=buffer) <= s1_dt):
                    model.AddImplication(presences[b1['id']], presences[b2['id']].Not())
            else:
                s1 = datetime_to_hours(b1['start_date'], base_time)
                e1 = datetime_to_hours(b1['end_date'], base_time)
                s2 = datetime_to_hours(b2['start_date'], base_time)
                e2 = datetime_to_hours(b2['end_date'], base_time)

                if not (e1 + buffer <= s2 or e2 + buffer <= s1):
                    model.AddImplication(presences[b1['id']], presences[b2['id']].Not())
                
    # Objective: Maximize total priority weight
    objective_terms = []
    for b in all_bookings:
        weight = PRIORITY_WEIGHTS.get(b['priority'], 1)
        # Small incumbency bonus: slightly prefer existing approved bookings over new ones of the same priority
        if b['id'] != 'new' and b.get('status') == 'approved':
            weight += 1 
        objective_terms.append(presences[b['id']] * weight)
        
    model.Maximize(sum(objective_terms))
    
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        is_accepted = solver.Value(presences['new']) == 1
        displaced_ids = [b['id'] for b in existing_bookings if solver.Value(presences[b['id']]) == 0]
                
        if is_accepted:
            if displaced_ids:
                return True, displaced_ids, f"Approved. Displaced lower priority bookings: {displaced_ids}"
            return True, [], "Approved without conflicts."
        else:
            return False, [], "Rejected: Conflicts with equal or higher priority bookings."
            
    return False, [], "Solver failed to find a valid schedule."
