'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	AppRoot,
	Button,
	ButtonCell,
	Cell,
	Headline,
	Info,
	Input,
	List,
	Modal,
	Placeholder,
	Section,
	Select,
} from '@telegram-apps/telegram-ui'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { Icon28AddCircleOutline } from '@vkontakte/icons'
import { Avatar, Image } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GrTask } from 'react-icons/gr'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface TimeSlotPickerComponentProps {
	specialistId: string | undefined
	services:
		| {
				id: number
				specialistId: string | undefined
				name: string
				description: string | null
				duration: number
				price: string | null
				valuta: string
		  }[]
		| null
}

const Services: React.FC<TimeSlotPickerComponentProps> = ({
	specialistId,
	services,
}) => {
	const router = useRouter()
	const { telegram_user, userPhoto } = useTelegramUserProfile()
	const [serviceData, setServiceData] = useState({
		name: '',
		description: '',
		price: '',
		duration: '',
		valuta: '',
	})

	// Состояние для списка услуг
	const [serviceList, setServiceList] = useState(services || [])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target
		setServiceData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async () => {
		const { name, description, price, duration, valuta } = serviceData

		// Basic validation
		if (!name || !description || !price || !duration || !valuta) {
			toast.error('Пожалуйста, заполните все поля.')
			return
		}

		try {
			// Формируем данные для отправки
			const requestData = {
				name,
				description,
				price,
				duration: parseInt(duration, 10), // Преобразуем в целое число
				specialistId: String(specialistId), // Убедимся, что specialistId - строка
				valuta,
			}

			const response = await fetch('/api/services', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData), // Отправляем данные
			})

			if (response.ok) {
				const newService = await response.json() // Получаем добавленную услугу

				// Обновляем состояние с ново добавленной услугой
				setServiceList(prev => [...prev, newService]) // Добавляем новую услугу в список
				toast.success('Услуга успешно добавлена')
				setServiceData({
					name: '',
					description: '',
					price: '',
					duration: '',
					valuta: '',
				}) // Очистка формы после добавления
			} else {
				toast.error('Ошибка при добавлении услуги')
			}
		} catch (error) {
			toast.error('Произошла ошибка при добавлении услуги')
		}
	}

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.back())
		tg.MainButton.hide()
	}, [])

	return (
		<>
			<ToastContainer />
			<AppRoot>
				<Section className='pt-2 mb-4'>
					<Cell
						before={
							<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
						}
						after={<Image width={150} src='/logo.svg' alt='Логотип' />}
					>
						{telegram_user?.first_name}
					</Cell>
				</Section>

				<List>
					<Section>
						<Cell
							before={
								<GrTask
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							}
							subtitle='Добавляйте и удаляйте свои услуги'
						>
							<Headline weight='2'>Мои услуги</Headline>
						</Cell>
						{serviceList.length === 0 ? (
							<Cell>
								<Headline weight='2'>У вас пока нет услуг.</Headline>
							</Cell>
						) : (
							serviceList.map(service => (
								<Cell
									after={
										<Info
											subtitle={`${service.duration.toString()} мин.`}
											type='text'
										>
											{service.price} {service.valuta}
										</Info>
									}
									subtitle={service.description}
									key={service.id}
								>
									{service.name}
								</Cell>
							))
						)}
						<Modal
							trigger={
								<ButtonCell
									before={<Icon28AddCircleOutline />}
									interactiveAnimation='opacity'
									mode='default'
								>
									Добавить услугу
								</ButtonCell>
							}
						>
							<ModalHeader></ModalHeader>
							<Input
								id='name'
								name='name'
								value={serviceData.name}
								status='focused'
								header='Название услуги'
								type='text'
								placeholder='Маникюр'
								onChange={handleChange}
							/>
							<Input
								id='description'
								name='description'
								value={serviceData.description}
								status='focused'
								header='Описание услуги'
								type='text'
								placeholder='Описание услуги'
								onChange={handleChange}
							/>
							<Input
								id='price'
								name='price'
								value={serviceData.price}
								status='focused'
								header='Стоимость'
								type='number'
								placeholder='2500'
								onChange={handleChange}
							/>
							<Select
								id='valuta'
								name='valuta'
								value={serviceData.valuta}
								status='focused'
								header='Валюта'
								onChange={handleChange}
							>
								<option value={'руб.'}>₽</option>
								<option value={'бел. руб.'}>BYN</option>
								<option value={'долл.'}>$</option>
								<option value={'евро'}>€</option>
								<option value={'гр. лари'}>₾</option>
								<option value={'тнг'}>₸</option>
							</Select>
							<Select
								id='duration'
								name='duration'
								value={serviceData.duration}
								status='focused'
								header='Длительность услуги(мин.)'
								onChange={handleChange}
							>
								<option value={15}>15</option>
								<option value={30}>30</option>
								<option value={45}>45</option>
								<option value={60}>60</option>
								<option value={75}>75</option>
								<option value={90}>90</option>
								<option value={105}>105</option>
								<option value={120}>120</option>
								<option value={135}>135</option>
								<option value={150}>150</option>
								<option value={180}>180</option>
								<option value={200}>200</option>
								<option value={220}>220</option>
							</Select>
							<Placeholder
								action={
									<ModalClose>
										<Button onClick={handleSubmit} size='m'>
											Добавить услугу
										</Button>
									</ModalClose>
								}
							></Placeholder>
						</Modal>
					</Section>
				</List>
			</AppRoot>
		</>
	)
}

export default Services
