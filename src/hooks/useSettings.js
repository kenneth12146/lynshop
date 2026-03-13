import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useSettings = () => {
  const [settings, setSettings] = useState({
    store_name: 'LynShop',
    whatsapp_number: '573000000000',
    instagram_url: '#',
    facebook_url: '#',
    tiktok_url: '#',
    logo_url: '',
    welcome_message: ''
  })

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .single()
      if (data) {
        setSettings({
          store_name: data.store_name || 'LynShop',
          whatsapp_number: data.whatsapp_number || '573000000000',
          instagram_url: data.instagram_url || '#',
          facebook_url: data.facebook_url || '#',
          tiktok_url: data.tiktok_url || '#',
          logo_url: data.logo_url || '',
          welcome_message: data.welcome_message || ''
        })
      }
    }
    fetch()
  }, [])

  return settings
}
