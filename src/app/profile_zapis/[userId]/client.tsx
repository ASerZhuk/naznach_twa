'use client'

import Container from '@/app/components/Container'
import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import { Cell, IconContainer, Section } from '@telegram-apps/telegram-ui'
import { Avatar, Image } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BsGeoAltFill } from 'react-icons/bs'
import { FaCalendarAlt } from 'react-icons/fa'

import { GrMoney } from 'react-icons/gr'
import {
	MdKeyboardArrowDown,
	MdKeyboardArrowUp,
	MdOutlinePhoneIphone,
} from 'react-icons/md'

interface ClientProps {
	user: {
		lastName: string | null
		firstName: string | null
		userId: string
		username: string | null
		price: string | null
		phone: string | null
		category: string | null
		description: string | null
		status: string | null
		address: string | null
	}
	grafik:
		| {
				specialistId: string | undefined
				startTime: string
				endTime: string
				interval: number
				dayOfWeek: number
				time: string[]
				id?: number
		  }[]
		| null
}

const Client = ({ user, grafik }: ClientProps) => {
	const [photo, setPhoto] = useState<string | undefined>()
	const [expanded, setExpanded] = useState(false)
	const { userPhoto, loading, error, telegram_user } = useTelegramUserProfile()

	const router = useRouter()

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.push(`/`))

		tg.MainButton.show()
		tg.MainButton.setText('Записаться')
		tg.MainButton.onClick(() => router.push(`/zapis/${user.userId}`))

		if (user) {
			const botToken = '7655736393:AAGYAPPjBo1WWKhAXtcUMj0FsTWH35Y7D8g' // Замените на токен вашего бота

			fetch(
				`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${user.userId}`
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
					if (!response?.ok) {
						throw new Error('Ошибка получения файла с Telegram API')
					}
					return response.json()
				})
				.then(fileData => {
					if (fileData?.result?.file_path) {
						setPhoto(
							`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
						)
					} else {
						throw new Error('Путь к файлу не найден')
					}
				})
				.catch(error => {
					console.error('Ошибка получения фото профиля:', error)
					setPhoto('/web-app/public/next.svg') // Путь к изображению-заглушке
				})
		}
	}, [user])

	// Функция для преобразования числового дня недели в текстовый
	const dayOfWeekNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

	const toggleExpanded = () => {
		setExpanded(!expanded)
	}

	return (
		<Container>
			<Section className='pt-2 pb-4'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={150} src='/logo.svg' alt='Логотип' />}
				>
					{telegram_user?.first_name}
				</Cell>
			</Section>

			{!user.status ? (
				<div></div>
			) : (
				<div className='bg-blue-200  p-2 border-l-4 border-blue-500  flex flex-row justify-between'>
					<span className='text-sm text-blue-500'>{user.status}</span>
				</div>
			)}

			<Section className='mt-4'>
				<Cell>
					<div className='flex flex-row items-center'>
						<div className=''>
							<Avatar src={photo} size={100} />
						</div>
						<div className='flex flex-col gap-1 ml-2'>
							<div className='text-xl font-semibold'>
								{user.firstName} {user.lastName}
							</div>
							<div className='flex items-center'>
								<MdOutlinePhoneIphone
									size={24}
									className='bg-blue-500 rounded-lg p-1 mr-2'
									color='white'
								/>
								<div className='text-blue-500'>{user.phone}</div>
							</div>

							<div className='mb-2 font-light'>{user.category}</div>
						</div>
					</div>
				</Cell>

				<Cell>
					<div className='text-wrap'>
						{user.description?.split('\n').map((line, index) => (
							<p key={index}>{line}</p>
						))}
					</div>
				</Cell>
				<Cell
					before={
						<IconContainer>
							<FaCalendarAlt
								size={32}
								className='bg-blue-500 p-1 rounded-lg'
								color='white'
							/>
						</IconContainer>
					}
					after={
						<IconContainer>
							{expanded ? (
								<MdKeyboardArrowUp size={24} />
							) : (
								<MdKeyboardArrowDown size={24} />
							)}
						</IconContainer>
					}
					onClick={toggleExpanded}
				>
					График работы
					{expanded && grafik && grafik.length > 0 && (
						<div className='flex items-center text-right mt-2'>
							<ul className='list-none m-0 p-0'>
								{grafik.map((item, index) => (
									<li key={index}>
										{dayOfWeekNames[item.dayOfWeek]}: {item.startTime} -{' '}
										{item.endTime}
									</li>
								))}
							</ul>
						</div>
					)}
				</Cell>
				<Cell
					before={
						<IconContainer>
							<GrMoney
								size={32}
								className='bg-blue-500 rounded-lg p-1'
								color='white'
							/>
						</IconContainer>
					}
					after={`${user.price} руб.`}
				>
					Стоимость услуги
				</Cell>
				<Cell
					before={
						<IconContainer>
							<BsGeoAltFill
								size={32}
								className='bg-blue-500 rounded-lg p-1'
								color='white'
							/>
						</IconContainer>
					}
				>
					{user.address}
				</Cell>
			</Section>
		</Container>
	)
}

export default Client
