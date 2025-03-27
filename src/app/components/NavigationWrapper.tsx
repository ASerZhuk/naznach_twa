'use client'

import { useEffect, useState } from 'react'
import BottomNav from './BottomNav'

const NavigationWrapper = () => {
	const [user, setUser] = useState<{
		isMaster: boolean
		telegramId: string
	} | null>(null)

	useEffect(() => {
		const initUser = async () => {
			try {
				const tg = window.Telegram.WebApp
				tg.ready()

				const userId = tg.initDataUnsafe?.user?.id.toString()

				if (userId) {
					const response = await fetch('/api/getUser', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ userId }),
					})

					if (response.ok) {
						const userData = await response.json()
						setUser(userData)
					}
				}
			} catch (error) {
				console.error('Error initializing user:', error)
			}
		}

		initUser()
	}, [])

	if (!user?.telegramId) return null

	return <BottomNav isMaster={user.isMaster} userId={user.telegramId} />
}

export default NavigationWrapper
