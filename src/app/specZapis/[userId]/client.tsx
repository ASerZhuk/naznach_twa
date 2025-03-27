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
	ButtonCell,
	Cell,
	Headline,
	IconContainer,
	List,
	Section,
} from '@telegram-apps/telegram-ui'
import { LuCalendarPlus } from 'react-icons/lu'
import { RiMessage2Line } from 'react-icons/ri'
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
import { Spin, Input } from 'antd'
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
		valuta: string | null
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
	const [dayMonth, setDayMonth] = useState<string>('')

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		phone: '',
	})

	const [serviceId, setServiceId] = useState<number | null>(null)
	const [selectedServices, setSelectedServices] = useState<
		{
			id: number
			name: string
			price: string | null
			duration: number
			valuta: string | null
		}[]
	>([])

	const totalPrice = selectedServices.reduce(
		(total, srv) => total + (parseFloat(srv.price || '0') || 0),
		0
	)
	const serviceNames = selectedServices.map(srv => srv.name).join(', ')

	//const vl = selectedServices.map(srv => srv.valuta)

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
		totalDuration: number,
		dayStart: number,
		dayEnd: number
	) => {
		const freeSlots: { start: number; end: number }[] = []
		let lastEnd = dayStart

		appointments.sort((a, b) => a.start - b.start)

		for (const appt of appointments) {
			while (lastEnd + totalDuration <= appt.start) {
				freeSlots.push({ start: lastEnd, end: lastEnd + totalDuration })
				lastEnd += totalDuration
			}
			lastEnd = Math.max(lastEnd, appt.end)
		}

		// Проверяем наличие свободных слот после последнего занятия
		while (lastEnd + totalDuration <= dayEnd) {
			freeSlots.push({ start: lastEnd, end: lastEnd + totalDuration })
			lastEnd += totalDuration
		}

		return freeSlots
	}

	const handleServiceSelect = (srv: {
		id: number
		name: string
		price: string | null
		duration: number
		valuta: string | null
	}) => {
		// Проверяем, уже выбрана ли услуга
		if (selectedServices.some(selected => selected.id === srv.id)) {
			// Если выбрана, убираем из выбранных
			setSelectedServices(prev =>
				prev.filter(selected => selected.id !== srv.id)
			)
		} else {
			// Если не выбрана, добавляем в выбранные
			setSelectedServices(prev => [...prev, srv])
		}
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
				const selectedDay = grafik.filter(g => g.dayOfWeek === dayOfWeek)

				if (selectedDay.length > 0) {
					try {
						const response = await fetch(
							`/api/appointments?specialistId=${user.userId}&date=${formatDate(
								selectedDate
							)}`
						)

						if (response.ok) {
							const appointments = await response.json()

							if (Array.isArray(appointments)) {
								// Преобразуем занятые слоты
								const occupiedSlots = appointments.map(appointment => {
									const [start, end] = appointment.time.split('-')
									return { start: parseTime(start), end: parseTime(end) }
								})

								// Находим начало и конец рабочего дня
								const startTime = Math.min(
									...selectedDay.map(slot => parseTime(slot.startTime))
								)
								const endTime = Math.max(
									...selectedDay.map(slot => parseTime(slot.endTime))
								)

								// Рассчитываем свободные слоты, основываясь на всех выбранных услугах
								const totalDuration = selectedServices.reduce(
									(total, srv) => total + srv.duration,
									0
								)

								const freeSlots = getFreeSlots(
									occupiedSlots,
									totalDuration,
									startTime,
									endTime
								)
								setAvailableTimes(
									freeSlots.map(
										slot =>
											`${formatTime(slot.start)} - ${formatTime(slot.end)}`
									)
								)
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

	const srvValuta = selectedServices.map(svr => svr.valuta)

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
					serviceName: serviceNames,
					serviceValuta: selectedServices[0]?.valuta,
					serviceIds: selectedServices.map(srv => srv.id),
					date: date,
					time: selectedTime,
					specialistName: user.firstName,
					specialistLastName: user.lastName,
					specialistPhone: user.phone,
					specialistAddress: user.address,
					specialistPrice: totalPrice.toString(),
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
	const onedate = `${date}`
	const [newdate, newmonth] = onedate.split('.')
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
	const monthName = months[parseInt(newmonth, 10) - 1]
	let bodyContent

	if (step === STEPS.SERVICE) {
		bodyContent = (
			<>
				<BackButton onClick={onBack} />
				<MainButton text='Далее' onClick={onNext} />
				<div
					style={{ background: `var(--tg-theme-section-bg-color)` }}
					className='flex p-4 items-center mt-2'
				>
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

				<div
					className='mt-2'
					style={{ background: `var(--tg-theme-section-bg-color)` }}
				>
					<form>
						{service.map(srv => (
							<div
								key={srv.id}
								className={`flex items-center justify-between p-4 cursor-pointer ${
									selectedServices.some(selected => selected.id === srv.id)
										? 'bg-blue-200'
										: ''
								}`}
								onClick={() => handleServiceSelect(srv)} // Обработчик клика
							>
								<div>
									<div style={{ color: `var(--tg-theme-text-color)` }}>
										{srv.name}
									</div>
									<div style={{ color: `var(--tg-theme-subtitle-text-color)` }}>
										{srv.description}
									</div>
								</div>
								<div className='text-right'>
									<div style={{ color: `var(--tg-theme-text-color)` }}>
										{srv.price !== null
											? `${srv.price} ${srv.valuta}`
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
			</>
		)
	}

	if (step === STEPS.DATE) {
		bodyContent = (
			<>
				<BackButton onClick={onBackStep} />
				<MainButton text='Далее' onClick={onNext} />
				<div
					style={{ background: `var(--tg-theme-section-bg-color)` }}
					className='flex p-4 items-center mt-2'
				>
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
									<Spin size='small' />
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
						style={{ background: `var(--tg-theme-section-bg-color)` }}
						className='flex p-4 items-center mt-2'
					>
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
					<div
						className='pl-4 pb-4 pr-4 text-lg pt-2'
						style={{ color: `var(--tg-theme-text-color)` }}
					>
						<form style={{ color: `var(--tg-theme-text-color)` }}>
							<label className='pb-2'>Имя</label>
							<Input
								id='firstName'
								name='firstName'
								type='text'
								placeholder='Иван'
								value={formData.firstName}
								onChange={handleChange}
								className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
								style={{
									background: `var(--tg-theme-section-bg-color)`,
									color: `var(--tg-theme-text-color)`,
								}}
							/>
							<label className='pb-2'>Фамилия</label>
							<Input
								id='lastName'
								name='lastName'
								type='text'
								placeholder='Иванов'
								value={formData.lastName}
								onChange={handleChange}
								className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8'
								style={{
									background: `var(--tg-theme-section-bg-color)`,
									color: `var(--tg-theme-text-color)`,
								}}
							/>
							<label className='pb-2'>Телефон</label>
							<Input
								id='phone'
								name='phone'
								type='tel'
								placeholder='+79990001111'
								value={formData.phone}
								onChange={handleChange}
								className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
								style={{
									background: `var(--tg-theme-section-bg-color)`,
									color: `var(--tg-theme-text-color)`,
								}}
							/>
						</form>
					</div>
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
					<div
						style={{ background: `var(--tg-theme-section-bg-color)` }}
						className='flex p-4 items-center mt-2'
					>
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
								Проверьте данные
							</div>
						</div>
					</div>
					<div className='flex flex-col mt-4 '>
						<div className='flex flex-col basis-1/2 p-2 bg-blue-500 text-white justify-center items-center ml-4 mr-4'>
							<div className='font-extrabold text-2xl'>
								{newdate} {monthName}
							</div>

							<div className='font-semibold'>{selectedTime}</div>
						</div>
						<div className='flex flex-col ml-4 mt-4'>
							<div className='flex items-center mb-2'>
								<div>
									<GrUser
										size={32}
										className='bg-blue-500 rounded-lg p-1'
										color='white'
									/>
								</div>
								<span className='pl-4'>
									Ваше имя: {formData.firstName} {formData.lastName}
								</span>
							</div>
							<div className='flex items-center mb-2'>
								<div>
									<MdOutlinePhoneIphone
										size={32}
										className='bg-blue-500 rounded-lg p-1'
										color='white'
									/>
								</div>
								<span className='pl-4'>Ваш номер: {formData.phone}</span>
							</div>
							<div className='flex items-center mb-2'>
								<div>
									<MdOutlinePhoneIphone
										size={32}
										className='bg-blue-500 rounded-lg p-1'
										color='white'
									/>
								</div>
								<span className='pl-4'>Услуга: {serviceNames}</span>
							</div>
							<div className='flex items-center mb-2'>
								<div>
									<GrMoney
										size={32}
										className='bg-blue-500 rounded-lg p-1'
										color='white'
									/>
								</div>

								<div>
									<span className='pl-4'>
										У оплате: {totalPrice.toFixed(0)}{' '}
										{selectedServices[0]?.valuta}
									</span>
								</div>
							</div>
						</div>
					</div>
				</AppRoot>
			</>
		)
	}

	const message = `Вы записаны на ${date} в ${selectedTime} к мастеру ${user.firstName} ${user.lastName} к оплате ${totalPrice}${selectedServices[0]?.valuta},\nТелефон для связи ${user.phone}\n\nУведомление из приложения:\nhttps://t.me/naznach_twa_bot`
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
