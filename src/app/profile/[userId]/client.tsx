'use client'

import Container from '@/app/components/Container'
import {
	Accordion,
	Blockquote,
	Cell,
	IconContainer,
	List,
	Section,
	Modal,
	Button,
	Placeholder,
	Input,
} from '@telegram-apps/telegram-ui'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { Icon28CloudSlashOutline, Icon28Dismiss } from '@vkontakte/icons'

import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { Avatar, Image } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BsGeoAltFill } from 'react-icons/bs'
import {
	FaCalendarAlt,
	FaChevronDown,
	FaChevronUp,
	FaPhone,
	FaRegEdit,
} from 'react-icons/fa'
import { GiPositionMarker } from 'react-icons/gi'
import { GrMoney } from 'react-icons/gr'
import { IoIosArrowForward } from 'react-icons/io'
import {
	MdArrowForwardIos,
	MdKeyboardArrowDown,
	MdKeyboardArrowUp,
	MdOutlinePhoneIphone,
} from 'react-icons/md'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ClientProps {
	user: {
		lastName: string | null
		firstName: string | null
		userId: string
		username: string | null
		price: string | null
		phone: string | null
		category: string | null
		address: string | null
		description: string | null
		status: string | null
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
	const [userPhoto, setUserPhoto] = useState<string | undefined>()
	const [status, setStatus] = useState(user.status)

	const [expanded, setExpanded] = useState(false)

	const router = useRouter()

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.push(`/`))

		tg.MainButton.show()
		tg.MainButton.setText('Изменить профиль')
		tg.MainButton.onClick(() => router.push(`/formSpecialist/${user.userId}`))

		if (user) {
			const botToken = '6874087551:AAHHCPMYy9JXgHVBavUdce_YjoXWgd0Fuew' // Замените на токен вашего бота

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
						setUserPhoto(
							`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
						)
					} else {
						throw new Error('Путь к файлу не найден')
					}
				})
				.catch(error => {
					console.error('Ошибка получения фото профиля:', error)
					setUserPhoto('/placeholder-image.jpg') // Путь к изображению-заглушке
				})
		}
	}, [user])

	// Функция для преобразования числового дня недели в текстовый
	const dayOfWeekNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

	const toggleExpanded = () => {
		setExpanded(!expanded)
	}

	const info = async () => {
		const status = document.getElementById('status') as HTMLInputElement
		const newStatus = status?.value

		if (newStatus) {
			try {
				const response = await fetch('/api/updateStatus', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ userId: user.userId, status: newStatus }),
				})

				if (response.ok) {
					setStatus(newStatus)
					toast.success('Статус успешно обновлен')
				} else {
					toast.error('Статус не обновлен')
				}
			} catch (error) {
				console.error('Ошибка при отправке запроса:', error)
			}
		}
	}

	return (
		<Container>
			<BackButton></BackButton>
			<Section className='pt-2 pb-4'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={150} src='/logo.svg' alt='Логотип' />}
				>
					{user?.firstName}
				</Cell>
			</Section>

			<ToastContainer />

			<div className='bg-blue-200 p-2 border-l-4 border-blue-500  flex flex-row justify-between'>
				<span className='text-sm text-blue-500'>{status}</span>
				<Modal
					header={
						<ModalHeader
							after={
								<ModalClose>
									<Icon28Dismiss
										style={{ color: 'var(--tgui--plain_foreground)' }}
									/>
								</ModalClose>
							}
						></ModalHeader>
					}
					trigger={
						<FaRegEdit
							size={24}
							className='bg-blue-500 rounded-lg p-1 mr-2'
							color='white'
						/>
					}
				>
					<div className='ml-4 mr-4 mb-16 mt-4'>
						<form id='statusForm' className='flex flex-col justify-between'>
							<Input
								header='Изменить статус'
								status='focused'
								type='text'
								id='status'
								placeholder='Отпуск с 1 по 10 января'
							/>
							<ModalClose>
								<Button className='mt-2' size='m' onClick={info}>
									Сохранить статус
								</Button>
							</ModalClose>
						</form>
					</div>
				</Modal>
			</div>

			<Section className='mt-4'>
				<Cell>
					<div className='flex flex-row items-center'>
						<div className=''>
							<Avatar src={userPhoto} size={100} />
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
					Мой график
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
