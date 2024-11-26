import { GetServerSideProps } from 'next'
import Container from './components/Container'
import Main from './components/Main'
import { getUserById } from './actions/getUserById'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface HomeProps {
	user: any
	loading: boolean
}

export default function Home({ user, loading }: HomeProps) {
	return (
		<AppRoot>
			<Container>
				<Main user={user} loading={loading} />
			</Container>
		</AppRoot>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const telegramId = context.req.cookies['telegramId'] // или получаем из query, и т.д.

	// Если нет telegramId, редиректим или возвращаем пустого пользователя
	if (!telegramId) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}
	}

	try {
		// Получаем данные пользователя на сервере
		const user = await getUserById(telegramId)
		return {
			props: {
				user,
				loading: false, // Данные уже получены, нет необходимости показывать loading
			},
		}
	} catch (error) {
		console.error('Ошибка при получении пользователя:', error)
		return {
			props: {
				user: null,
				loading: false,
			},
		}
	}
}
