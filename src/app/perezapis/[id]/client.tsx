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
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	Blockquote,
	ButtonCell,
	Cell,
	Headline,
	List,
	Section,
	Spinner,
} from '@telegram-apps/telegram-ui'
import { LuCalendarPlus } from 'react-icons/lu'
import { RiMessage2Line } from 'react-icons/ri'
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
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

	appointments: {
		id: number
		clientId: string
		firstName: string
		lastName: string
		specialistId: string
		date: string
		time: string
		phone: string
		specialistName: string | null
		specialistLastName: string | null
		specialistAddress: string | null
		specialistPrice: string | null
		specialistPhone: string | null
		serviceName: string | null
	}

	grafik: {
		specialistId: string
		dayOfWeek: number
		startTime: string
		endTime: string
	}[]
	service: {
		id: number
		name: string
		description: string | null
		price: string | null
		duration: number
	}[]
	serviceIds: {
		id: number
		appointmentId: number
		serviceId: number
	}[]
}
enum STEPS {
	DATE = 0,
	NOT = 1,
}

const Perezapis = ({
	user,
	grafik,
	appointments,
	service,
	serviceIds,
}: ClientProps) => {
	const router = useRouter()
	const [step, setStep] = useState(STEPS.DATE)
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

	const oldDate = appointments.date
	const oldTime = appointments.time

	const formatDate = (date: Date | null) => {
		if (!date) {
			return null // Если дата не выбрана, возвращаем null
		}
		return format(date, 'dd.MM.yyyy') // Форматируем дату в 'дд.мм.гггг'
	}
	const date = formatDate(selectedDate)

	const onBack = () => {
		router.back()
	}

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

		while (lastEnd + duration <= dayEnd) {
			freeSlots.push({ start: lastEnd, end: lastEnd + duration })
			lastEnd += duration
		}

		return freeSlots
	}

	const isDayAvailable = (date: Date) => {
		const dayOfWeek = date.getDay()
		return grafik.some(grafik => grafik.dayOfWeek === dayOfWeek)
	}

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
							const appointmentsResponse = await response.json()

							if (Array.isArray(appointmentsResponse)) {
								const occupiedSlots = appointmentsResponse.map(
									(appointment: { time: string }) => {
										const [start, end] = appointment.time.split('-')
										return { start: parseTime(start), end: parseTime(end) }
									}
								)

								const startTime = Math.min(
									...selectedDay.map(slot => parseTime(slot.startTime))
								)

								const endTime = Math.max(
									...selectedDay.map(slot => parseTime(slot.endTime))
								)

								if (serviceIds && serviceIds.length > 0) {
									const serviceIdsArray = serviceIds.map(
										idObj => idObj.serviceId
									)
									const selectedServices = service.filter(srv =>
										serviceIdsArray.includes(srv.id)
									)

									const totalDuration = selectedServices.reduce(
										(total, srv) => total + srv.duration,
										0
									)

									console.log('Total Duration:', totalDuration) // Можно удалить это, если не нужно

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
									console.error('Не указаны идентификаторы услуг')
									setAvailableTimes([])
								}
							} else {
								console.error(
									'Ответ от API не является массивом:',
									appointmentsResponse
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
	}, [selectedDate, grafik, appointments]) // добавлено appointments для обновления

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
			const response = await fetch(`/api/appointments?id=${appointments.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					date: date, // Преобразуем дату в строку
					time: selectedTime,
				}),
			})

			if (!response.ok) {
				throw new Error('Ошибка при создании записи')
			}

			const data = await response.json()
			console.log('Запись успешно перезаписана:', data)
			toast.success('Запись перезаписана успешно')
			if (!specWrite) {
				router.push('/')
			} else setStep(value => value + 1)
		} catch (error) {
			console.error('Ошибка при перезаписи записи:', error)
		}
	}

	let bodyContent

	//Уведомление на ТГ и ВатсАпп
	const specWrite = appointments.clientId === appointments.specialistId

	if (step === STEPS.DATE) {
		bodyContent = (
			<>
				<BackButton onClick={onBack} />
				{specWrite ? (
					<MainButton text='Далее' onClick={handleSubmit} />
				) : (
					<MainButton text='Перезаписать' onClick={handleSubmit} />
				)}

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
															: 'bg-gray-200 hover:bg-gray-300'
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

	// Сообщение для отправки
	const message = `Вы перезаписаны ${oldDate} в ${oldTime} на ${date} в ${selectedTime} к мастеру ${user.firstName} ${user.lastName}.\nНа услугу ${appointments.serviceName} к оплате ${appointments.specialistPrice} руб.\nТелефон для связи ${user.phone}\n\nУведомление из приложения:\nhttps://t.me/naznach_twa_bot`
	const encodedMessage = encodeURIComponent(message)

	// Шаг для отправки уведомления
	if (step === STEPS.NOT) {
		bodyContent = (
			<>
				<BackButton onClick={() => router.push('/')} />
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
							<a href={`https://t.me/${user.phone}?text=${encodedMessage}`}>
								<span className='text-blue-500 ml-6'>Отправить в Telegram</span>
							</a>
						</div>
						<ButtonCell
							onClick={() => {
								const encodedMessage = encodeURIComponent(message)
								window.open(
									`https://wa.me/${user.phone}?text=${encodedMessage}`
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
			</>
		)
	}

	return (
		<Container>
			<div>{bodyContent}</div>
		</Container>
	)
}

export default Perezapis
