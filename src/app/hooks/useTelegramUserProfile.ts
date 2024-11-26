import { useState, useEffect } from 'react'

interface WebAppUser {
	id: number
	first_name: string
	last_name?: string
	username?: string
	language_code?: string
}

const useTelegramUserProfile = () => {
	const [telegram_user, setTelegram_User] = useState<WebAppUser | null>(null)
	const [userPhoto, setUserPhoto] = useState<string | undefined>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()

		const telegramUser = tg.initDataUnsafe?.user

		if (telegramUser) {
			setTelegram_User(telegramUser)

			// Получаем фото профиля пользователя через Telegram API
			const botToken = '6874087551:AAHHCPMYy9JXgHVBavUdce_YjoXWgd0Fuew'

			fetch(
				`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramUser.id}`
			)
				.then(response => {
					if (!response.ok) {
						throw new Error('Ошибка получения данных от Telegram API')
					}
					return response.json()
				})
				.then(data => {
					if (data?.result?.photos?.length > 0) {
						const file = data.result.photos[0][0].file_id
						return fetch(
							`https://api.telegram.org/bot${botToken}/getFile?file_id=${file}`
						)
					} else {
						throw new Error('Фотографии профиля не найдены')
					}
				})
				.then(response => {
					if (!response.ok) {
						throw new Error('Ошибка получения файла с Telegram API')
					}
					return response.json()
				})
				.then(fileData => {
					if (fileData?.result?.file_path) {
						setUserPhoto(
							`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
						)
					} else {
						throw new Error('Путь к файлу не найден')
					}
				})
				.catch(error => {
					console.error('Ошибка получения фото профиля:', error)
					setError(error.message)
					setUserPhoto('/placeholder-image.jpg') // Путь к изображению-заглушке
				})
				.finally(() => setLoading(false))
		} else {
			setLoading(false)
		}
	}, [])

	return { telegram_user, userPhoto, loading, error }
}

export default useTelegramUserProfile
