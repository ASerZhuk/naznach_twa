'use client'

import { useEffect, useState } from 'react'
import Main from './components/Main'
import { Spin } from 'antd'

export default function Home() {
	const [user, setUser] = useState(null)
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const initApp = async () => {
			try {
				const tg = window.Telegram.WebApp
				tg.ready()

				const userId = tg.initDataUnsafe?.user?.id.toString()

				if (userId) {
					// Получаем данные пользователя
					const userResponse = await fetch('/api/getUser', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ userId }),
					})

					if (userResponse.ok) {
						const userData = await userResponse.json()
						setUser(userData)

						// Получаем записи пользователя
						const appointmentsResponse = await fetch(
							'/api/getUserAppointments',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									userId: userData.telegramId,
									isMaster: userData.isMaster,
								}),
							}
						)

						if (appointmentsResponse.ok) {
							const appointmentsData = await appointmentsResponse.json()
							setAppointments(appointmentsData)
						}
					}
				}
			} catch (error) {
				console.error('Error initializing app:', error)
			} finally {
				setLoading(false)
			}
		}

		initApp()
	}, [])

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	if (!user) {
		return null
	}

	return <Main user={user} appointments={appointments} />
}
