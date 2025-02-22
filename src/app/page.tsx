'use client'

import Container from './components/Container'
import { useEffect, useState } from 'react'
import Main from './components/Main'
import { getUserById } from './actions/getUserById'
import { AppRoot } from '@telegram-apps/telegram-ui'

export default function Home() {
	const [telegramId, setTelegramId] = useState<string>()
	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()

		const id = tg.initDataUnsafe?.user?.id.toString()
		setTelegramId(id)
		console.log(id)

		const fetchUser = async () => {
			if (telegramId) {
				try {
					const userData = await getUserById(telegramId) // передаем идентификатор
					setUser(userData)
				} catch (error) {
					console.error('Ошибка при загрузке пользователя:', error)
				} finally {
					setLoading(false)
				}
			}
		}

		fetchUser()
	}, [telegramId])

	return <Main user={user} />
}
