export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          street: string
          city: string
          state: string | null
          zip: string
          country: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          label?: string
          street: string
          city: string
          state?: string | null
          zip: string
          country?: string
          is_default?: boolean
        }
        Update: {
          label?: string
          street?: string
          city?: string
          state?: string | null
          zip?: string
          country?: string
          is_default?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          barcode: string | null
          category_id: string | null
          stock_quantity: number
          min_stock_threshold: number
          is_active: boolean
          is_featured: boolean
          weight: number | null
          dimensions: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          stock_quantity?: number
          min_stock_threshold?: number
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          stock_quantity?: number
          min_stock_threshold?: number
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
        }
        Update: {
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price_adjustment: number
          stock_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          product_id: string
          name: string
          sku?: string | null
          price_adjustment?: number
          stock_quantity?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          sku?: string | null
          price_adjustment?: number
          stock_quantity?: number
          is_active?: boolean
        }
        Relationships: []
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          session_id?: string | null
        }
        Update: {
          user_id?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: OrderStatus
          subtotal: number
          shipping_cost: number
          tax_amount: number
          discount_amount: number
          total: number
          shipping_address: Json
          billing_address: Json | null
          payment_intent_id: string | null
          payment_status: string
          stripe_session_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          status?: OrderStatus
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total: number
          shipping_address: Json
          billing_address?: Json | null
          payment_intent_id?: string | null
          payment_status?: string
          stripe_session_id?: string | null
          notes?: string | null
        }
        Update: {
          status?: OrderStatus
          payment_intent_id?: string | null
          payment_status?: string
          stripe_session_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          product_name: string
          product_sku: string | null
          product_image_url: string | null
          variant_name: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          order_id: string
          product_id: string
          variant_id?: string | null
          product_name: string
          product_sku?: string | null
          product_image_url?: string | null
          variant_name?: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
        }
        Update: {
          rating?: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      daily_sales_summary: {
        Row: {
          day: string | null
          total_orders: number | null
          unique_customers: number | null
          total_revenue: number | null
          average_order_value: number | null
          revenue_per_order: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      refresh_daily_sales_summary: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}

export type CartWithItems = {
  id: string
  user_id: string | null
  session_id: string | null
  created_at: string
  updated_at: string
  cart_items: {
    id: string
    cart_id: string
    product_id: string
    variant_id: string | null
    quantity: number
    unit_price: number
    created_at: string
    products: {
      id: string
      name: string
      slug: string
      price: number
      compare_price: number | null
      stock_quantity: number
      is_active: boolean
      product_images: { url: string; alt_text: string | null }[]
    } | null
    product_variants: {
      id: string
      name: string
      price_adjustment: number
      stock_quantity: number
    } | null
  }[]
}
