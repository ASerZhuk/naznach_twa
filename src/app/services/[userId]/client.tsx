'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	AppRoot,
	Button,
	ButtonCell,
	Cell,
	Headline,
	Info,
	List,
	Modal,
	Placeholder,
	Section,
	Select,
} from '@telegram-apps/telegram-ui'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { Icon28AddCircleOutline } from '@vkontakte/icons'
import { Alert, Avatar, Image, Input, Space } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaRegEdit } from 'react-icons/fa'
import { GrTask } from 'react-icons/gr'
import { MdDeleteForever } from 'react-icons/md'
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
				valuta: string | null
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
		duration: '15',
		valuta: 'руб.',
	})

	// Состояние для списка услуг
	const [serviceList, setServiceList] = useState(services || [])

	const [editingService, setEditingService] = useState<any>(null)

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

	const handleEditSubmit = async () => {
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
				duration: parseInt(duration, 10),
				specialistId: String(specialistId),
				valuta,
			}

			// Отправляем данные для редактирования
			const response = await fetch(`/api/services?id=${editingService.id}`, {
				method: 'PUT', // Используем метод PUT для обновления
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData),
			})

			if (response.ok) {
				const updatedService = await response.json()
				// Обновляем услугу в списке
				setServiceList(prev =>
					prev.map(service =>
						service.id === updatedService.id ? updatedService : service
					)
				)
				toast.success('Услуга успешно обновлена')
				setServiceData({
					name: '',
					description: '',
					price: '',
					duration: '',
					valuta: '',
				})
				setEditingService(null) // Закрытие формы редактирования
			} else {
				toast.error('Ошибка при обновлении услуги')
			}
		} catch (error) {
			toast.error('Произошла ошибка при обновлении услуги')
		}
	}

	const handleEdit = (service: any) => {
		setEditingService(service)
		setServiceData({
			name: service.name || '',
			description: service.description || '',
			price: service.price || '',
			duration: String(service.duration) || '15',
			valuta: service.valuta || 'руб.',
		})
	}

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`/api/services?id=${id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
			})

			if (response.ok) {
				// Если удаление прошло успешно, обновляем состояние
				setServiceList(prev => prev.filter(service => service.id !== id))
				toast.success('Услуга успешно удалена')
			} else {
				toast.error('Ошибка при удалении услуги')
			}
		} catch (error) {
			toast.error('Произошла ошибка при удалении услуги')
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
			<div
				className='flex items-center justify-between pb-2 pt-2'
				style={{ background: `var(--tg-theme-section-bg-color)` }}
			>
				<div className='pl-4'>
					<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					<span
						style={{ color: `var(--tg-theme-text-color)` }}
						className='pl-2'
					>
						{telegram_user?.first_name}
					</span>
				</div>
				<div className='pr-4'>
					<Image width={35} src='/logo.svg' alt='Логотип' />
				</div>
			</div>

			<div
				style={{ background: `var(--tg-theme-section-bg-color)` }}
				className='flex p-4 items-center mt-2'
			>
				<div>
					<GrTask
						size={32}
						className='bg-blue-500 p-1 rounded-lg'
						color='white'
					/>
				</div>
				<div className='pl-6'>
					<div
						style={{ color: `var(--tg-theme-text-color)` }}
						className='text-lg font-bold'
					>
						Мои услуги
					</div>
					<div
						style={{ color: `var(--tg-theme-subtitle-text-color)` }}
						className='text-sm'
					>
						Добавляйте и удаляйте свои услуги
					</div>
				</div>
			</div>

			<div
				className='mt-2'
				style={{ background: `var(--tg-theme-section-bg-color)` }}
			>
				{serviceList.length === 0 ? (
					<div
						className='pl-4 pb-4 text-lg'
						style={{ color: `var(--tg-theme-text-color)` }}
					>
						У вас пока нет услуг.
					</div>
				) : (
					serviceList.map(service => (
						<div
							key={service.id}
							className='flex flex-row items-center p-4 border-b'
							style={{ borderColor: `var(--tg-theme-subtitle-text-color)` }}
						>
							<div className='basis-1/2'>
								<div style={{ color: `var(--tg-theme-text-color)` }}>
									{service.name}
								</div>
								<div style={{ color: `var(--tg-theme-subtitle-text-color)` }}>
									{service.description}
								</div>
							</div>

							<div className='text-right basis-1/2 pr-4'>
								<div style={{ color: `var(--tg-theme-text-color)` }}>
									{service.price !== null
										? `${service.price} ${service.valuta}`
										: 'Цена не указана'}
								</div>
								<div
									style={{ color: `var(--tg-theme-subtitle-text-color)` }}
								>{`${service.duration.toString()} мин.`}</div>
							</div>
							<div className='basis-1/8'>
								<AppRoot>
									<Modal
										trigger={
											<FaRegEdit
												size={32}
												className='bg-green-500 p-1 rounded-lg mb-2'
												color='white'
												onClick={() => handleEdit(service)}
											/>
										}
									>
										<ModalHeader></ModalHeader>
										<div className='pl-4 pr-4'>
											<label className='pb-2'>Название услуги</label>
											<Input
												id='name'
												name='name'
												value={serviceData.name}
												type='text'
												placeholder='Маникюр'
												onChange={handleChange}
												className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
												style={{
													background: `var(--tg-theme-section-bg-color)`,
													color: `var(--tg-theme-text-color)`,
												}}
											/>
											<label className='pb-2'>Описание услуги</label>
											<Input
												id='description'
												name='description'
												value={serviceData.description}
												type='text'
												placeholder='Обычная услуга'
												onChange={handleChange}
												className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
												style={{
													background: `var(--tg-theme-section-bg-color)`,
													color: `var(--tg-theme-text-color)`,
												}}
											/>
											<label className='pb-2'>Стоимость услуги</label>
											<Input
												id='price'
												name='price'
												value={serviceData.price}
												type='number'
												placeholder='2500'
												onChange={handleChange}
												className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
												style={{
													background: `var(--tg-theme-section-bg-color)`,
													color: `var(--tg-theme-text-color)`,
												}}
											/>
											<div className='flex flex-col'>
												<label className='pb-2'>Валюта</label>
												<select
													id='valuta'
													name='valuta'
													value={serviceData.valuta}
													onChange={handleChange}
													className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
													style={{
														background: `var(--tg-theme-section-bg-color)`,
														color: `var(--tg-theme-text-color)`,
													}}
												>
													<option value={'руб.'}>₽</option>
													<option value={'бел. руб.'}>Br</option>
													<option value={'долл.'}>$</option>
													<option value={'евро'}>€</option>
													<option value={'груз. лари'}>₾</option>
													<option value={'тнг'}>₸</option>
												</select>
												<label className='pb-2'>Время на клиента</label>
												<select
													id='duration'
													name='duration'
													value={serviceData.duration}
													onChange={handleChange}
													className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
													style={{
														background: `var(--tg-theme-section-bg-color)`,
														color: `var(--tg-theme-text-color)`,
													}}
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
												</select>
											</div>
										</div>
										<Placeholder
											action={
												<ModalClose>
													<Button onClick={handleEditSubmit} size='m'>
														Сохранить изменения
													</Button>
												</ModalClose>
											}
										></Placeholder>
									</Modal>
								</AppRoot>
								<MdDeleteForever
									size={32}
									className='bg-red-500 p-1 rounded-lg'
									color='white'
									onClick={() => handleDelete(service.id)}
								/>
							</div>
						</div>
					))
				)}
			</div>
			<AppRoot>
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
					<div className='pl-4 pr-4'>
						<label className='pb-2'>Название услуги</label>
						<Input
							id='name'
							name='name'
							value={serviceData.name}
							type='text'
							placeholder='Маникюр'
							onChange={handleChange}
							className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
							style={{
								background: `var(--tg-theme-section-bg-color)`,
								color: `var(--tg-theme-text-color)`,
							}}
						/>
						<label className='pb-2'>Описание услуги</label>
						<Input
							id='description'
							name='description'
							value={serviceData.description}
							type='text'
							placeholder='Обычная услуга'
							onChange={handleChange}
							className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
							style={{
								background: `var(--tg-theme-section-bg-color)`,
								color: `var(--tg-theme-text-color)`,
							}}
						/>
						<label className='pb-2'>Стоимость услуги</label>
						<Input
							id='price'
							name='price'
							value={serviceData.price}
							type='number'
							placeholder='2500'
							onChange={handleChange}
							className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
							style={{
								background: `var(--tg-theme-section-bg-color)`,
								color: `var(--tg-theme-text-color)`,
							}}
						/>
						<div className='flex flex-col'>
							<label className='pb-2'>Валюта</label>
							<select
								id='valuta'
								name='valuta'
								value={serviceData.valuta}
								onChange={handleChange}
								className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
								style={{
									background: `var(--tg-theme-section-bg-color)`,
									color: `var(--tg-theme-text-color)`,
								}}
							>
								<option value={'руб.'}>₽</option>
								<option value={'бел. руб.'}>Br</option>
								<option value={'долл.'}>$</option>
								<option value={'евро'}>€</option>
								<option value={'лари'}>₾</option>
								<option value={'тнг'}>₸</option>
							</select>
							<label className='pb-2'>Время на клиента</label>
							<select
								id='duration'
								name='duration'
								value={serviceData.duration}
								onChange={handleChange}
								className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
								style={{
									background: `var(--tg-theme-section-bg-color)`,
									color: `var(--tg-theme-text-color)`,
								}}
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
							</select>
						</div>
					</div>
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
			</AppRoot>
		</>
	)
}

export default Services
