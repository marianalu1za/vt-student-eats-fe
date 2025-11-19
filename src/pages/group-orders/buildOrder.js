export function buildGroupOrderPayload(raw) {
  return {
    // keep what the user actually picked
    restaurant: raw.restaurant,
    
    // hard-coded for now (you’d normally get this from auth)
    created_by_user: 4,

    // default values
    status: "open",
    current_capacity: 0,

    // convert your datetime string to full ISO with seconds + Z
    // if you don't need that, you can just use raw.pick_up_time
    pick_up_time: new Date(raw.pick_up_time).toISOString(),

    // turn null into {} 
    tags: raw.tags ?? {},

    // keep user-entered value if present, otherwise fall back to "max int"
    max_capacity: raw.max_capacity ?? 2147483647,
  }
}