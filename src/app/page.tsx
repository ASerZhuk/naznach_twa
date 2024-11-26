import { Suspense } from 'react'
import Container from './components/Container'
import Main from './components/Main'
import { getUserById } from './actions/getUserById'
import { AppRoot } from '@telegram-apps/telegram-ui'

// This will be a server-side function that fetches user data
const fetchUser = async (telegramId: string) => {
	try {
		const response = await fetch('/api/getUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId: telegramId }), // передаем userId в теле запроса
		})

		if (!response.ok) {
			throw new Error('Ошибка при загрузке данных пользователя')
		}

		const userData = await response.json()
		return userData
	} catch (error) {
		console.error('Ошибка при получении пользователя:', error)
		return null
	}
}

export default async function Home() {
	const tg = typeof window !== 'undefined' ? window.Telegram.WebApp : null
	const telegramId = tg?.initDataUnsafe?.user?.id?.toString() || ''

	// Fetch user data before rendering
	const user = await fetchUser(telegramId)

	return (
		<AppRoot>
			<Container>
				<Suspense fallback={<div>Loading...</div>}>
					<Main user={user} />
				</Suspense>
			</Container>
		</AppRoot>
	)
}
