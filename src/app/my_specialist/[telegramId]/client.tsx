'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	Cell,
	Headline,
	List,
	Placeholder,
	Section,
} from '@telegram-apps/telegram-ui'
import { Avatar, Button, Image, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ImProfile } from 'react-icons/im'
import { MdArrowForwardIos } from 'react-icons/md'

// Интерфейс для данных специалиста
interface Specialist {
	id: string
	firstName: string
	lastName: string
	category: string
	photoUrl?: string // Добавляем поле для фото
}

interface MySpecialistProps {
	appointment:
		| {
				id: number
				specialistId: string
		  }[]
		| null
}

const MySpecialist: React.FC<MySpecialistProps> = ({ appointment }) => {
	const [specialists, setSpecialists] = useState<Specialist[]>([])
	const [specialistIds, setSpecialistIds] = useState<string[]>([]) // Состояние для хранения specialistId
	const router = useRouter()
	const { telegram_user, userPhoto, loading, error } = useTelegramUserProfile()

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.push('/'))
		tg.MainButton.hide()

		if (appointment) {
			const fetchSpecialists = async () => {
				const uniqueSpecialistIds = Array.from(
					new Set(appointment.map(app => app.specialistId))
				)

				setSpecialistIds(uniqueSpecialistIds) // Сохраняем specialistId в состоянии

				// Загружаем данные о специалистах по их ID
				const fetchedSpecialists = await Promise.all(
					uniqueSpecialistIds.map(async id => {
						const res = await fetch('/api/getSpecialist', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ specialistId: id }),
						})

						const specialistData = await res.json()

						// Получаем фото профиля через Telegram API
						const botToken = '7655736393:AAGYAPPjBo1WWKhAXtcUMj0FsTWH35Y7D8g' // Ваш токен бота

						try {
							const profilePhotoResponse = await fetch(
								`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${id}`
							)

							if (profilePhotoResponse.ok) {
								const profilePhotoData = await profilePhotoResponse.json()

								if (profilePhotoData?.result?.photos?.length > 0) {
									const fileId = profilePhotoData.result.photos[0][0].file_id

									// Получаем путь к файлу по file_id
									const fileResponse = await fetch(
										`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
									)

									if (fileResponse.ok) {
										const fileData = await fileResponse.json()

										if (fileData?.result?.file_path) {
											// Устанавливаем URL фотографии специалиста
											specialistData.photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
										}
									}
								}
							}
						} catch (error) {
							console.error('Ошибка получения фото профиля:', error)
							specialistData.photoUrl = '/placeholder-image.jpg' // Устанавливаем заглушку
						}

						return specialistData
					})
				)

				setSpecialists(fetchedSpecialists)
			}

			fetchSpecialists()
		}
	}, [appointment])

	return (
		<>
			<Section className='pt-2 pb-4'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={35} src='/logo.svg' alt='Логотип' />}
				>
					{telegram_user?.first_name}
				</Cell>
			</Section>

			<Section>
				<Cell
					before={
						<ImProfile
							size={32}
							className='bg-blue-500 p-1 rounded-lg'
							color='white'
						/>
					}
					subtitle='Список специалистов для записи'
				>
					<Headline weight='2'>Мои специалисты</Headline>
				</Cell>
			</Section>

			<List>
				<div>
					{specialists.length > 0 && appointment ? (
						specialists.map((specialist, index) => (
							<Section
								key={specialistIds[index]}
								className='mt-2'
								onClick={() =>
									router.push(`/profile_zapis/${specialistIds[index]}`)
								}
							>
								<Cell
									className='p-2'
									before={
										<Avatar
											src={specialist.photoUrl || '/placeholder-image.jpg'}
											size={84}
											className='mt-2 mb-2'
										/>
									}
									subtitle={specialist.category}
									after={<MdArrowForwardIos />}
								>
									{specialist.firstName} {specialist.lastName}
								</Cell>
							</Section>
						))
					) : (
						<div className='HIJtihMA8FHczS02iWF5'>
							<Placeholder header='Записей нет'>
								<img
									alt='Telegram sticker'
									className='blt0jZBzpxuR4oDhJc8s'
									src='https://media.giphy.com/media/TqGcOed29VJdjkNyy6/giphy.gif'
									width='50%'
								/>
							</Placeholder>
						</div>
					)}
				</div>
			</List>
		</>
	)
}

export default MySpecialist
