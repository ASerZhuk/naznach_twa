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
registerLocale('ru', ru as any)

interface ClientProps {
	user: {
		lastName: string | null
		firstName: string | null
		userId: string
		username: string | null
		phone: string | null
		category: string | null
		address: string | null
	}
	timeslot: {
		id: number
		specialistId: string
		grafikId: number
		serviceId: number
		serviceName: string
		dayOfWeek: number
		startTime: string
		endTime: string
		duration: number
	}[]
	service: {
		id: number
		name: string
		description: string | null
		price: string | null
		duration: number
	}[]
}

enum STEPS {
	SERVICE = 0,
	DATE = 1,
	INFO = 2,
	CONF = 3,
	NOT = 4,
}

const Zapis = ({ user, timeslot, service }: ClientProps) => {
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
		return timeslot.some(slot => slot.dayOfWeek === dayOfWeek)
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
				const selectedDay = timeslot.filter(
					slot => slot.dayOfWeek === dayOfWeek
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
	}, [selectedDate, timeslot, serviceId])

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
			const response = await fetch('/api/appointments', {
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
			toast.success('Запись прошла успешно')
			setTimeout(() => {
				router.replace(`/`)
			}, 1000)
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
				<List>
					<Section className='pt-2'>
						<Cell
							before={
								<MdChecklist
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							}
							subtitle='Выберите нужную услугу'
						>
							<Headline weight='2'>Услуги</Headline>
						</Cell>
						<form>
							{service.map(srv => (
								<Cell
									key={srv.id}
									Component='label'
									before={
										<Radio
											name='radio'
											value={srv.id}
											onChange={() => handleServiceSelect(srv)}
										/>
									}
									description={srv.description}
									multiline
									after={
										<Info
											subtitle={`${srv.duration.toString()} мин.`}
											type='text'
										>
											{srv.price !== null
												? `${srv.price} руб.`
												: 'Цена не указана'}
										</Info>
									}
								>
									{srv.name}
								</Cell>
							))}
						</form>
					</Section>
				</List>
			</>
		)
	}

	if (step === STEPS.DATE) {
		bodyContent = (
			<>
				<BackButton onClick={onBack} />
				<MainButton text='Далее' onClick={onNext} />

				<List>
					<Section className='pt-2'>
						<Cell
							before={
								<LuCalendarPlus
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							}
							subtitle='Выберите дату и время записи'
						>
							<Headline weight='2'>Дата и время</Headline>
						</Cell>
						<div className='flex-col bg-white rounded-lg shadow-md p-6 text-xl flex justify-center'>
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
								<div className='mt-4 p-6'>
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
															: 'bg-blue-200 hover:bg-gray-300'
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
					</Section>
				</List>
			</>
		)
	}

	if (step === STEPS.INFO) {
		bodyContent = (
			<>
				<BackButton onClick={onBackStep} />
				<MainButton text='Далее' onClick={onNext} />
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
			</>
		)
	}
	if (step === STEPS.CONF) {
		bodyContent = (
			<>
				<BackButton onClick={onBackStep} />
				<MainButton text='Записаться' onClick={handleSubmit} />
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
			</>
		)
	}

	return (
		<Container>
			<div>{bodyContent}</div>
		</Container>
	)
}

export default Zapis
