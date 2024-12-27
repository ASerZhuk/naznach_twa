'use client'

import Container from '@/app/components/Container'
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app'
import { ru } from 'date-fns/locale'

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './calendar.css'
import { addMonths, format } from 'date-fns'
import { GrContactInfo, GrMoney, GrUser } from 'react-icons/gr'
import { MdChecklist, MdMoreTime, MdOutlinePhoneIphone } from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CiCalendarDate } from 'react-icons/ci'

import {
	AppRoot,
	Blockquote,
	Button,
	ButtonCell,
	Cell,
	Headline,
	IconContainer,
	Info,
	Input,
	List,
	Placeholder,
	Radio,
	Section,
	Spinner,
} from '@telegram-apps/telegram-ui'
import { LuCalendarPlus } from 'react-icons/lu'
import { RiMessage2Line } from 'react-icons/ri'
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
registerLocale('ru', ru as any)

interface SpecZapisProps {
	user: {
		lastName: string | null
		firstName: string | null
		userId: string
		username: string | null
		phone: string | null
		category: string | null
		address: string | null
	}

	service: {
		id: number
		name: string
		description: string | null
		price: string | null
		duration: number
	}[]
	grafik: {
		specialistId: string
		dayOfWeek: number
		startTime: string
		endTime: string
	}[]
}

enum STEPS {
	SERVICE = 0,
	DATE = 1,
	INFO = 2,
	CONF = 3,
	NOT = 4,
}

const SpecZapis = ({ user, service, grafik }: SpecZapisProps) => {
	const router = useRouter()
	const [step, setStep] = useState(STEPS.SERVICE)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [availableTimes, setAvailableTimes] = useState<string[]>([])
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [clientId, setClientId] = useState<number | undefined>()
	const [isLoading, setIsLoading] = useState(true)

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		phone: '',
	})

	const [serviceId, setServiceId] = useState<number | null>(null)
	const [serviceName, setServiceName] = useState<string | null>(null)
	const [servicePrice, setServicePrice] = useState<string | null>(null)

	// Утилиты для работы с временем
	const parseTime = (timeString: string): number => {
		const [hours, minutes] = timeString.split(':').map(Number)
		return hours * 60 + minutes // Конвертируем время в минуты
	}

	const formatTime = (minutes: number): string => {
		const hours = Math.floor(minutes / 60)
			.toString()
			.padStart(2, '0')
		const mins = (minutes % 60).toString().padStart(2, '0')
		return `${hours}:${mins}`
	}

	const getFreeSlots = (
		appointments: { start: number; end: number }[],
		duration: number,
		dayStart: number,
		dayEnd: number
	) => {
		const freeSlots: { start: number; end: number }[] = []
		let lastEnd = dayStart

		appointments.sort((a, b) => a.start - b.start)

		for (const appt of appointments) {
			while (lastEnd + duration <= appt.start) {
				freeSlots.push({ start: lastEnd, end: lastEnd + duration })
				lastEnd += duration
			}
			lastEnd = Math.max(lastEnd, appt.end)
		}

		// Проверяем наличие свободных слот после последнего занятия
		while (lastEnd + duration <= dayEnd) {
			freeSlots.push({ start: lastEnd, end: lastEnd + duration })
			lastEnd += duration
		}

		return freeSlots
	}

	const handleServiceSelect = (srv: {
		id: number
		name: string
		price: string | null
		duration: number
	}) => {
		setServiceId(srv.id)
		setServiceName(srv.name || 'Не указано')
		setServicePrice(srv.price || 'Нет цены')
	}

	const formatDate = (date: Date | null) => {
		if (!date) {
			return null
		}
		return format(date, 'dd.MM.yyyy')
	}
	const date = formatDate(selectedDate)

	const onBack = () => {
		router.back()
	}
	const onNext = () => {
		setStep(value => value + 1)
	}
	const onBackStep = () => {
		setStep(value => value - 1)
	}

	// Функция для проверки, является ли день рабочим
	const isDayAvailable = (date: Date) => {
		const dayOfWeek = date.getDay()
		return grafik.some(grafik => grafik.dayOfWeek === dayOfWeek)
	}

	// Обновление доступных временных интервалов на основе выбранной даты
	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()

		const usr = tg.initDataUnsafe?.user
		setClientId(usr?.id)

		const fetchAppointments = async () => {
			if (selectedDate) {
				const dayOfWeek = selectedDate.getDay()
				const selectedDay = grafik.filter(
					grafik => grafik.dayOfWeek === dayOfWeek
				)

				if (selectedDay.length > 0) {
					try {
						const response = await fetch(
							`/api/appointments?specialistId=${user?.userId}&date=${date}`
						)

						if (response.ok) {
							const appointments = await response.json()

							if (Array.isArray(appointments)) {
								// Преобразуем полученные данные о занятых слотах
								const occupiedSlots = appointments.map(
									(appointment: { time: string }) => {
										const [start, end] = appointment.time.split('-')
										return { start: parseTime(start), end: parseTime(end) }
									}
								)

								// Находим начало и конец рабочего дня из слотов
								const startTime = Math.min(
									...selectedDay.map(slot => parseTime(slot.startTime))
								)
								const endTime = Math.max(
									...selectedDay.map(slot => parseTime(slot.endTime))
								)

								// Используем продолжительность услуги для расчета свободных слотов
								if (serviceId) {
									const selectedService = service.find(
										srv => srv.id === serviceId
									)
									if (selectedService) {
										const freeSlots = getFreeSlots(
											occupiedSlots,
											selectedService.duration,
											startTime,
											endTime
										)
										setAvailableTimes(
											freeSlots.map(
												slot =>
													`${formatTime(slot.start)} - ${formatTime(slot.end)}`
											)
										)
									}
								}
							} else {
								console.error(
									'Ответ от API не является массивом:',
									appointments
								)
								setAvailableTimes([])
							}
						} else {
							console.error('Ошибка при загрузке записей')
							setAvailableTimes([])
						}
					} catch (error) {
						console.error('Ошибка при загрузке записей:', error)
						setAvailableTimes([])
					}
				} else {
					setAvailableTimes([])
				}
				setIsLoading(false)
			}
		}

		fetchAppointments()
	}, [selectedDate, serviceId])

	const handleTimeSelect = (time: string) => {
		setSelectedTime(time)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value,
		})
	}

	const handleSubmit = async () => {
		try {
			const response = await fetch('/api/appointmentsSpec', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					specialistId: user.userId,
					clientId: clientId?.toString(),
					serviceId: serviceId,
					serviceName: serviceName,
					date: date,
					time: selectedTime,
					specialistName: user.firstName,
					specialistLastName: user.lastName,
					specialistPhone: user.phone,
					specialistAddress: user.address,
					specialistPrice: servicePrice,
				}),
			})

			if (!response.ok) {
				throw new Error('Ошибка при создании записи')
			}

			const data = await response.json()

			setStep(value => value + 1)
			toast.success('Запись прошла успешно')
		} catch (error) {
			console.error('Ошибка при создании записи:', error)
		}
	}

	let bodyContent

	if (step === STEPS.SERVICE) {
		bodyContent = (
			<>
				<BackButton onClick={onBack} />
				<MainButton text='Далее' onClick={onNext} />
				<div
					style={{ background: `var(--tg-theme-bg-color)` }}
					className='h-full min-h-screen w-full min-w-screen m-0'
				>
					<div className='flex p-4 items-center'>
						<div>
							<MdChecklist
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
								Услуги
							</div>
							<div
								style={{ color: `var(--tg-theme-subtitle-text-color)` }}
								className='text-sm'
							>
								Выберите нужную услугу
							</div>
						</div>
					</div>
					<div>
						<form>
							{service.map(srv => (
								<div
									key={srv.id}
									className={`flex items-center justify-between p-4 cursor-pointer ${
										serviceId === srv.id ? 'bg-blue-200' : ''
									}`} // Измените цвет фона при выборе
									onClick={() => handleServiceSelect(srv)} // Обработчик клика
								>
									<div>
										<div style={{ color: `var(--tg-theme-text-color)` }}>
											{srv.name}
										</div>
										<div
											style={{ color: `var(--tg-theme-subtitle-text-color)` }}
										>
											{srv.description}
										</div>
									</div>
									<div className='text-right'>
										<div style={{ color: `var(--tg-theme-text-color)` }}>
											{srv.price !== null
												? `${srv.price} руб.`
												: 'Цена не указана'}
										</div>
										<div
											style={{ color: `var(--tg-theme-subtitle-text-color)` }}
										>{`${srv.duration.toString()} мин.`}</div>
									</div>
								</div>
							))}
						</form>
					</div>
				</div>
			</>
		)
	}

	if (step === STEPS.DATE) {
		bodyContent = (
			<>
				<BackButton onClick={onBackStep} />
				<MainButton text='Далее' onClick={onNext} />
				<div
					style={{ background: `var(--tg-theme-bg-color)` }}
					className='h-full min-h-screen w-full min-w-screen m-0'
				>
					<div className='flex p-4 items-center'>
						<div>
							<LuCalendarPlus
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
								Дата и время
							</div>
							<div
								style={{ color: `var(--tg-theme-subtitle-text-color)` }}
								className='text-sm'
							>
								Выберите дату и время записи
							</div>
						</div>
					</div>
					<div>
						<div className='mt-4 flex justify-center'>
							<DatePicker
								selected={selectedDate}
								onChange={date => setSelectedDate(date)}
								filterDate={isDayAvailable}
								minDate={new Date()}
								maxDate={addMonths(new Date(), 1)}
								locale='ru'
								inline
								className='datepicker-custom'
							/>
						</div>
						{selectedDate && (
							<div className='mt-4 p-6 ml-0 mr-0'>
								<div className='grid grid-cols-2 gap-4 place-items-center text-sm'>
									{isLoading ? (
										<Spinner size='m' />
									) : availableTimes.length > 0 ? (
										availableTimes.map((time, index) => (
											<button
												key={index}
												onClick={() => handleTimeSelect(time)}
												className={`px-3 py-2 rounded-full ${
													selectedTime === time
														? 'bg-blue-500 text-white'
														: 'bg-white hover:bg-gray-300 text-black'
												}`}
											>
												{time}
											</button>
										))
									) : (
										<p>Нет свободного времени</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</>
		)
	}

	if (step === STEPS.INFO) {
		bodyContent = (
			<>
				<AppRoot>
					<BackButton onClick={onBackStep} />
					<MainButton text='Далее' onClick={onNext} />
					<div
						style={{ background: `var(--tg-theme-bg-color)` }}
						className='h-full min-h-screen w-full min-w-screen m-0'
					>
						<div className='flex p-4 items-center'>
							<div>
								<LuCalendarPlus
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
									Контактная информация
								</div>
								<div
									style={{ color: `var(--tg-theme-subtitle-text-color)` }}
									className='text-sm'
								>
									Введите необходимые данные
								</div>
							</div>
						</div>
						<form>
							<Input
								status='focused'
								header='Введите имя'
								id='firstName'
								name='firstName'
								type='text'
								placeholder='Иван'
								value={formData.firstName}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Введите фамилию'
								id='lastName'
								name='lastName'
								type='text'
								placeholder='Иванов'
								value={formData.lastName}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Номер телефона'
								id='phone'
								name='phone'
								type='tel'
								placeholder='+79990001111'
								value={formData.phone}
								onChange={handleChange}
							/>
						</form>
					</div>

					<List>
						<Section className='pt-2'>
							<Cell
								before={
									<GrContactInfo
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								}
								subtitle='Введите необходимые данные'
							>
								<Headline weight='2'>Контактная информация</Headline>
							</Cell>
							<form>
								<Input
									status='focused'
									header='Введите имя'
									id='firstName'
									name='firstName'
									type='text'
									placeholder='Иван'
									value={formData.firstName}
									onChange={handleChange}
								/>
								<Input
									status='focused'
									header='Введите фамилию'
									id='lastName'
									name='lastName'
									type='text'
									placeholder='Иванов'
									value={formData.lastName}
									onChange={handleChange}
								/>
								<Input
									status='focused'
									header='Номер телефона'
									id='phone'
									name='phone'
									type='tel'
									placeholder='+79990001111'
									value={formData.phone}
									onChange={handleChange}
								/>
							</form>
						</Section>
					</List>
				</AppRoot>
			</>
		)
	}

	if (step === STEPS.CONF) {
		bodyContent = (
			<>
				<AppRoot>
					<BackButton onClick={onBackStep} />
					<MainButton text='Записать' onClick={handleSubmit} />
					<ToastContainer />
					<List>
						<Section className='pt-2'>
							<Cell
								before={
									<GrContactInfo
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								}
								subtitle='Проверьте данные перед записью'
							>
								<Headline weight='2'>Контактная информация</Headline>
							</Cell>
							<Cell
								before={
									<IconContainer>
										<GrUser
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={
									<div className='text-blue-500'>
										{formData.firstName} {formData.lastName}
									</div>
								}
							>
								Имя
							</Cell>
							<Cell
								before={
									<IconContainer>
										<MdOutlinePhoneIphone
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={<div className='text-blue-500'>{formData.phone}</div>}
							>
								Телефон
							</Cell>
							<Cell
								before={
									<IconContainer>
										<CiCalendarDate
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={<div className='text-blue-500'>{date}</div>}
							>
								Дата записи
							</Cell>
							<Cell
								before={
									<IconContainer>
										<MdMoreTime
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={<div className='text-blue-500'>{selectedTime}</div>}
							>
								Время записи
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
								after={<div className='text-blue-500'>{servicePrice} руб.</div>}
							>
								Стоимость
							</Cell>
						</Section>
					</List>
				</AppRoot>
			</>
		)
	}

	const message = `Вы записаны на ${date} в ${selectedTime} к мастеру ${user.firstName} ${user.lastName} к оплате ${servicePrice} руб.\nТелефон для связи ${user.phone}\n\nУведомление из приложения:\nhttps://t.me/naznach_twa_bot`
	const encodedMessage = encodeURIComponent(message)

	if (step === STEPS.NOT) {
		bodyContent = (
			<>
				<AppRoot>
					<BackButton
						onClick={() => {
							router.push('/')
						}}
					/>
					<List>
						<Section className='pt-2'>
							<Cell
								before={
									<RiMessage2Line
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								}
								subtitle='Отправьте уведомление о записи'
							>
								<Headline weight='2'>Уведомление</Headline>
							</Cell>
						</Section>
						<Section>
							<Blockquote className='flex flex-col' type='text'>
								<div>Автоматическое сообщение клиенту:</div>
								<div className='mt-2'>{message}</div>
							</Blockquote>
							<div className='flex mt-4 mb-3 ml-6'>
								<FaTelegramPlane size={24} color='#3b82f6' />
								<a
									href={`https://t.me/${formData.phone}?text=${encodedMessage}`}
								>
									<span className='text-blue-500 ml-6'>
										Отправить в Telegram
									</span>
								</a>
							</div>
							<ButtonCell
								onClick={() => {
									const encodedMessage = encodeURIComponent(message)
									window.open(
										`https://wa.me/${formData.phone}?text=${encodedMessage}`
									)
								}}
								before={<FaWhatsapp size={24} color='green' />}
							>
								<span className='text-green-500'>
									Отправить клиенту в WhatsApp
								</span>
							</ButtonCell>
						</Section>
					</List>
				</AppRoot>
			</>
		)
	}

	return (
		<Container>
			<div>{bodyContent}</div>
		</Container>
	)
}

export default SpecZapis
