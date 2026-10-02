import type { Listing } from '../../types/listing'

export const sampleListings: Listing[] = [
  { id: 'book-1', seller_id: 'student-1', title: 'Calculus: Early Transcendentals', description: 'Eighth edition, clean pages with a few pencil notes.', price: 38, category: 'Books', item_condition: 'Good', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80', created_at: '2026-09-28T09:00:00Z' },
  { id: 'calculator-1', seller_id: 'student-2', title: 'TI-84 Plus graphing calculator', description: 'Works well and includes the slide cover.', price: 55, category: 'Calculators', item_condition: 'Like new', image_url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80', created_at: '2026-09-27T14:30:00Z' },
  { id: 'bag-1', seller_id: 'student-3', title: 'Canvas everyday backpack', description: 'Roomy main pocket and padded laptop sleeve.', price: 24, category: 'Bags', item_condition: 'Good', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', created_at: '2026-09-26T10:15:00Z' },
  { id: 'lab-1', seller_id: 'student-4', title: 'Chemistry lab glassware set', description: 'Clean borosilicate beakers and flasks, ready for lab work.', price: 18, category: 'Lab equipment', item_condition: 'Like new', image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80', created_at: '2026-09-25T16:00:00Z' },
]

export const sampleSellerContacts = {
  'student-1': { name: 'Alex Morgan', email: 'alex.morgan@campus.example', phone: '(555) 010-0101' },
  'student-2': { name: 'Jordan Lee', email: 'jordan.lee@campus.example', phone: '(555) 010-0102' },
  'student-3': { name: 'Taylor Brooks', email: 'taylor.brooks@campus.example', phone: '(555) 010-0103' },
  'student-4': { name: 'Sam Rivera', email: 'sam.rivera@campus.example', phone: '(555) 010-0104' },
} as const