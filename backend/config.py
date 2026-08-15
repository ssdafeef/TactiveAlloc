import os

# Default Transport Buffer Hours for moving equipment between distinct sites
# Set as 4 hours as requested by the user, intentionally simplified for prototype.
TRANSPORT_BUFFER_HOURS = int(os.getenv("TRANSPORT_BUFFER_HOURS", 4))
