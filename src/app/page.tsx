'use client'

import Container from './components/Container'

import Main from './components/Main'
import { getUserById } from './actions/getUserById'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { useInitData } from '@vkruglikov/react-telegram-web-app'

export default async function Home() {
	//const [user, setUser] = useState<any>(null)
	const [initDataUnsafe] = useInitData()
	const telegramId = initDataUnsafe?.user?.id.toString()

	if (!telegramId) {
		// Возвращаем или показываем ошибку, если telegramId не существует
		return <div>Ошибка: Не удалось получить Telegram ID</div>
	}

	const user = await getUserById(telegramId)

	return (
		<AppRoot>
			<Container>
				<Main user={user} />
			</Container>
		</AppRoot>
	)
}
