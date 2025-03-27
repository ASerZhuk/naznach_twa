'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import { Avatar, Image, DatePicker, Select, Input } from 'antd'
import locale from 'antd/es/date-picker/locale/ru_RU'
import dayjs, { Dayjs } from 'dayjs'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
	FaRegEdit,
	FaTelegramPlane,
	FaUserAltSlash,
	FaWhatsapp,
} from 'react-icons/fa'
import {
	MdOutlineCancel,
	MdMoreTime,
	MdOutlinePhoneIphone,
	MdChecklist,
	MdArrowForwardIos,
	MdDeleteForever,
} from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './calendar.css'
import {
	AppRoot,
	Blockquote,
	Button,
	ButtonCell,
	Cell,
	Headline,
	IconContainer,
	List,
	Modal,
	Placeholder,
	Section,
} from '@telegram-apps/telegram-ui'
import { LuCalendarPlus } from 'react-icons/lu'
import { CiCalendarDate } from 'react-icons/ci'
import { GrMoney, GrPhone, GrUser } from 'react-icons/gr'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { Icon28Dismiss } from '@vkontakte/icons'

interface MySpecialBookingProps {
	appointment:
		| {
				id: number
				clientId: string
				firstName: string
				lastName: string
				specialistId: string
				date: string
				time: string
				serviceName: string | null
				serviceValuta: string | null
				phone: string
				specialistName: string | null
				specialistLastName: string | null
				specialistAddress: string | null
				specialistPrice: string | null
				specialistPhone: string | null
		  }[]
		| null
}

const MySpecialBooking: React.FC<MySpecialBookingProps> = ({ appointment }) => {
	const router = useRouter()
	const { telegram_user, userPhoto } = useTelegramUserProfile()
	const [clientAppointments, setClientAppointments] = useState(
		appointment || []
	)

	const [cancelReason, setCancelReason] = useState('')
	const [writeSpec, setWriteSpec] = useState(false)
	const [message, setMessage] = useState({
		date: '',
		time: '',
		specialistName: '',
		specialistLastName: '',
		specialistPhone: '',
	})

	const [selectedAppointmentId, setSelectedAppointmentId] = useState<
		number | null
	>(null)
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
	const [filteredAppointments, setFilteredAppointments] =
		useState(clientAppointments)
	const [selectedService, setSelectedService] = useState<string | null>(null)
	const servicesList = Array.from(
		new Set(clientAppointments.map(app => app.serviceName))
	)
	const [filter, setFilter] = useState('all')

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.push('/'))
		tg.MainButton.hide()

		if (appointment && appointment.length > 0) {
			setClientAppointments([...appointment].reverse())
			setFilteredAppointments([...appointment].reverse())
		}
	}, [appointment])

	useEffect(() => {
		if (selectedDate || selectedService) {
			const filtered = clientAppointments.filter(app => {
				const isSameDate = selectedDate
					? dayjs(app.date, 'DD.MM.YYYY').isSame(dayjs(selectedDate), 'day')
					: true
				const isSameService = selectedService
					? app.serviceName === selectedService
					: true

				return isSameDate && isSameService
			})
			setFilteredAppointments(filtered)
		} else {
			setFilteredAppointments(clientAppointments)
		}
	}, [selectedDate, selectedService, clientAppointments])

	const handleCancel = async () => {
		if (!cancelReason.trim()) {
			toast.error('Пожалуйста, укажите причину отмены')
			return
		}

		if (selectedAppointmentId !== null) {
			try {
				const response = await fetch(
					`/api/appointments?id=${selectedAppointmentId}`,
					{
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ reason: cancelReason }),
					}
				)

				if (response.ok) {
					setClientAppointments(prevAppointments =>
						prevAppointments.filter(app => app.id !== selectedAppointmentId)
					)
					toast.success('Запись успешно отменена')
				} else {
					toast.error('Не удалось отменить запись')
				}
			} catch (error) {
				console.error('Ошибка при отмене записи:', error)
				toast.error('Произошла ошибка при отмене записи')
			}
		}
	}

	const openCancelModal = (
		appointmentId: number,
		clientId: string,
		specialistId: string,
		date: string,
		time: string,
		specialistName: string | null,
		specialistLastName: string | null,
		specialistPhone: string | null
	) => {
		setSelectedAppointmentId(appointmentId)
		setCancelReason('')

		if (clientId === specialistId) {
			setWriteSpec(true)
			setMessage({
				date: date,
				time: time,
				specialistName: specialistName || 'Не указано',
				specialistLastName: specialistLastName || 'Не указано',
				specialistPhone: specialistPhone || 'Не указано',
			})
		}
	}
	const messageData = `Ваша запись на ${message.date} в ${message.time} к мастеру ${message.specialistName} ${message.specialistLastName} отменена. Причина: ${cancelReason}. Телефон для связи: ${message.specialistPhone}. Уведомление из приложения: https://t.me/naznach_twa_bot`
	const encodedMessage = encodeURIComponent(messageData)

	const groupedAppointments = filteredAppointments.reduce((acc, app) => {
		const date = app.date

		// Разделяем дату на день и месяц
		const [day, month] = date.split('.')

		if (!acc[date]) {
			acc[date] = []
		}
		acc[date].push(app)
		return acc
	}, {} as { [key: string]: typeof filteredAppointments })

	const months = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря',
	]

	// Рендерим записи с датами в читаемом формате
	const renderAppointments = Object.keys(groupedAppointments).map(date => {
		const [day, month] = date.split('.') // Разделяем дату на день и месяц
		const monthName = months[parseInt(month, 10) - 1] // Преобразуем номер месяца в название

		return (
			<div
				key={date}
				style={{ backgroundColor: `var(--tg-theme-section-bg-color)` }}
				className='mt-4 pb-4'
			>
				<div className='pt-4 pl-4 text-xl font-semibold'>
					{`${day} ${monthName}`} {/* Выводим день и месяц */}
				</div>
				{groupedAppointments[date].map(app => {
					// Извлекаем время начала и конца из строки вида "12:00 - 16:45"
					const [startTime, endTime] = app.time.split(' - ')

					// Функция для преобразования строки "19.01.2025 12:00" в объект Date
					const convertToDate = (dateString: string, timeString: string) => {
						const [day, month, year] = dateString.split('.').map(Number)
						const [hours, minutes] = timeString.split(':').map(Number)
						const date = new Date(year, month - 1, day, hours, minutes, 0, 0) // month - 1, так как месяц в JavaScript начинается с 0
						return date
					}

					// Сначала преобразуем дату и время в Date объекты для начала и конца
					const startDate = convertToDate(date, startTime)
					const endDate = convertToDate(date, endTime)

					// Получаем текущее время
					const now = new Date()

					// Проверка, если текущее время больше или равно конечному времени, то запись устарела
					const isPastAppointment = now > endDate

					return (
						
								<><div key={app.id} className='pt-4'>
							<div>
								<div
									className={`rounded-lg ml-4 mr-4 pt-2 pb-2 border-l-4 flex items-center justify-between ${isPastAppointment
											? 'border-red-500'
											: 'border-green-500'}`}
									style={{
										backgroundColor: `var(--tg-theme-secondary-bg-color)`,
									}}
								>
									<div>
										<div className='pl-4 font-bold text-blue-500'>
											{app.time}
										</div>
										<div className='pl-4 text-sm font-bold'>
											{app.firstName} {app.lastName}
										</div>
										<div className='pl-4 text-xs font-normal text-blue-500'>
											{app.phone}
										</div>
										<div className='pl-4 w-95 text-xs break-words'>
											{app.serviceName}
										</div>
										<div className='pl-4 text-sm text-blue-500'>
											{app.specialistPrice} {app.serviceValuta}
										</div>
									</div>
									<div className='pr-4'>
										<div><FaRegEdit
												size={32}
												className='bg-green-500 p-1 rounded-lg mb-2'
												color='white'
												onClick={() => router.push(`/perezapis/${app.id}`)}
											/></div>
										<Modal
											header={<ModalHeader></ModalHeader>}
											trigger={<div className='flex justify-center'>
											<button
												onClick={() => openCancelModal(
													app.id,
													app.clientId,
													app.specialistId,
													app.date,
													app.time,
													app.specialistName,
													app.specialistLastName,
													app.specialistPhone
												)}
											>
											<div className='flex items-center'>
												<MdDeleteForever
													size={32}
													className='bg-red-500 p-1 rounded-lg'
													color='white'
												/>	
											</div>
									</button>
							</div>}
						>
								{app.clientId === app.specialistId ? (
									<div className='flex flex-col ml-4 mr-4'>
										<label className='pb-2'>Причина отмены</label>
										<Input
											value={cancelReason}
											onChange={e => setCancelReason(e.target.value)}
											placeholder='Сегодня не работаю'
											className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
											style={{
												background: `var(--tg-theme-section-bg-color)`,
												color: `var(--tg-theme-text-color)`,
											}} />

										<div>
											<Blockquote className='flex flex-col' type='text'>
												<div>Автоматическое сообщение клиенту:</div>
												<div className='mt-2'>
													Ваша запись на {app.date} в {app.time} к мастеру{' '}
													{app.specialistName} {app.specialistLastName}{' '}
													отменена. Причина: {cancelReason}. Телефон для связи:{' '}
													{app.specialistPhone}. Уведомление из приложения:{' '}
													<a href='https://t.me/naznach_twa_bot'>
														https://t.me/naznach_twa_bot
													</a>
												</div>
											</Blockquote>
										</div>

										<div onClick={handleCancel} className='flex mt-4 mb-3 ml-6'>
											<FaTelegramPlane size={24} color='#3b82f6' />
											<a
												href={`https://t.me/${app.phone}?text=${encodeURIComponent(messageData)}`}
											>
												<span className='text-blue-500 ml-4'>
													Отменить и отправить клиенту в Telegram
												</span>
											</a>
										</div>

										<div
											className='flex mt-4 mb-3 ml-6'
											onClick={() => {
												handleCancel()
												window.open(
													`https://wa.me/${app.phone}?text=${encodedMessage}`
												)
											} }
										>
											<FaWhatsapp size={24} color='green' />
											<span className='text-green-500 ml-4'>
												Отменить и отправить клиенту в WhatsApp
											</span>
										</div>

										<Button
											className=' ml-4 mr-4 mb-8'
											size='m'
											onClick={handleCancel}
										>
											Отменить без уведомления клиенту
										</Button>
									</div>
								) : (
									<div className='flex flex-col ml-4 mr-4'>
										<label className='pb-2'>Причина отмены</label>
										<Input
											value={cancelReason}
											onChange={e => setCancelReason(e.target.value)}
											placeholder='Сегодня не работаю'
											className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
											style={{
												background: `var(--tg-theme-section-bg-color)`,
												color: `var(--tg-theme-text-color)`,
											}} />

										<ModalClose>
											<Button
												className=' ml-4 mr-4 mb-8'
												size='m'
												onClick={handleCancel}
											>
												Подтвердить
											</Button>
										</ModalClose>
									</div>
								)}
							</Modal>
							
									</div>
								</div>
							</div>
						</div>
						</>
						
					)
				})}
			</div>
		)
	})

	return (
		<>
			<ToastContainer />
			<AppRoot>
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

				<Section className='pt-2'>
					<Cell
						before={
							<LuCalendarPlus
								size={32}
								className='bg-blue-500 p-1 rounded-lg'
								color='white'
							/>
						}
						subtitle='Актуальные и прошедшие записи'
					>
						<Headline weight='2'>Запись ко мне</Headline>
					</Cell>
					<div className=' p-4'>
						<DatePicker
							locale={locale}
							onChange={date => setSelectedDate(date)}
							placeholder='Выберите дату'
							format={'DD.MM.YYYY'}
							style={{ width: '100%' }}
						/>
						<Select
							style={{ width: '100%', marginTop: '16px' }}
							placeholder='Выберите услугу'
							onChange={value => setSelectedService(value)}
							defaultValue={null}
						>
							<Select.Option value={null}>Все услуги</Select.Option>
							{servicesList.map(service => (
								<Select.Option key={service} value={service}>
									{service}
								</Select.Option>
							))}
						</Select>
						<div className='flex items-center justify-evenly mt-4 '>
							<div className='border-l-4 pl-2 border-green-500 text-xs'>
								Не завершенная запись
							</div>
							<div className='border-l-4 pl-2 border-red-500 text-xs'>
								Завершенная запись
							</div>
						</div>
					</div>
				</Section>

				<List>
					<div>{renderAppointments}</div>
				</List>
			</AppRoot>
		</>
	)
}

export default MySpecialBooking
