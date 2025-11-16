export const existingRestaurants = [
  { id: 1, name: 'Chipotle', phoneNumber: '(540) 555-0201', email: 'bob@chipotle.com', createdAt: '2024-02-01' },
  { id: 2, name: 'Subway', phoneNumber: '(540) 555-0202', email: 'alice@subway.com', createdAt: '2024-02-05' },
  { id: 3, name: 'Pizza Hut', phoneNumber: '(540) 555-0203', email: 'charlie@pizzahut.com', createdAt: '2024-02-10' },
]

export const pendingRestaurants = [
  { id: 1, name: 'New Burger Place', phoneNumber: '(540) 555-0101', email: 'david@burger.com', link: 'https://newburgerplace', submittedAt: '2024-03-01', ownerId: 3 },
  { id: 2, name: 'Taco Express', phoneNumber: '(540) 555-0102', email: 'sarah@taco.com', link: 'https://tacoexpress', submittedAt: '2024-03-05', ownerId: 3 },
  { id: 3, name: 'Sushi House', phoneNumber: '(540) 555-0103', email: 'mike@sushi.com', link: 'https://sushihouse', submittedAt: '2024-03-10', ownerId: 2 },
]

export const VTusers = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
  { id: 4, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 5, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 6, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
  { id: 7, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 8, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 9, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
  { id: 10, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 11, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 12, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
  { id: 13, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 14, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 15, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
  { id: 16, firstName: 'John', lastName: 'Doe', email: 'john@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-01-15' },
  { id: 17, firstName: 'Jane', lastName: 'Smith', email: 'jane@vt.edu', role: 'Staff', status: 'Active', createdAt: '2024-01-20' },
  { id: 18, firstName: 'Bob', lastName: 'Johnson', email: 'bob@vt.edu', role: 'Student', status: 'Active', createdAt: '2024-02-01' },
]

export const groupOrders = [
  { id: 1, host: 'John Doe', restaurant: 'Chipotle', meetTime: '2024-03-15 12:00 PM', meetPlace: 'Squires Student Center', createdAt: '2024-03-10', maxUsers: 5, currentUsers: 3, status: 'current' },
  { id: 2, host: 'Jane Smith', restaurant: 'Subway', meetTime: '2024-03-16 1:00 PM', meetPlace: 'Newman Library', createdAt: '2024-03-11', maxUsers: 8, currentUsers: 8, status: 'ended' },
  { id: 3, host: 'Bob Johnson', restaurant: 'Pizza Hut', meetTime: '2024-03-17 6:00 PM', meetPlace: 'D2 Dining Hall', createdAt: '2024-03-12', maxUsers: 10, currentUsers: 5, status: 'current' },
]