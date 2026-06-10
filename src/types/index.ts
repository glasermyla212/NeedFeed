export type UserRole = 'recipient' | 'donor' | 'foodbank' | 'admin'

export type RequestStatus = 'pending' | 'processing' | 'packed' | 'delivered' | 'cancelled'

export type ItemPriority = 'essential' | 'important' | 'preferred'

export type DonationType = 'one_time' | 'monthly'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string
  created_at: string
}

export interface RecipientProfile {
  id: string
  user_id: string
  household_size: number
  num_children: number
  dietary_restrictions: string[]
  allergies: string[]
  address: string
  city: string
  state: string
  zip: string
  verified: boolean
  anonymous_label: string
}

export interface FoodRequest {
  id: string
  recipient_id: string
  status: RequestStatus
  foodbank_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items: FoodRequestItem[]
}

export interface FoodRequestItem {
  id: string
  request_id: string
  name: string
  category: string
  quantity: number
  priority: ItemPriority
  fulfilled: boolean
}

export interface Donation {
  id: string
  donor_id: string
  amount: number
  type: DonationType
  recipient_id: string | null
  bundle_id: string | null
  stripe_payment_id: string
  created_at: string
}

export interface FoodBundle {
  id: string
  name: string
  description: string
  suggested_amount: number
  items: string[]
}

export interface FoodBank {
  id: string
  user_id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  approved: boolean
  service_area_zips: string[]
}
