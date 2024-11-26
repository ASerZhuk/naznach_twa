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
	Cell,
	Headline,
	List,
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
		price: string | null
		phone: string | null
		category: string | null
		address: string | null
	}

	garfik: {
		dayOfWeek: number
		time: string[] // Время интервалов в виде массива строк
	}[]

	appointments: {
		id: number | null
	}
}

enum STEPS {
	DATE = 0,
}

const Perezapis = ({ user, garfik, appointments }: ClientProps) => {
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

	// Функция для проверки, является ли день рабочим
	const isDayAvailable = (date: Date) => {
		const dayOfWeek = date.getDay()
		return garfik.some(slot => slot.dayOfWeek === dayOfWeek)
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
				const selectedDay = garfik.find(slot => slot.dayOfWeek === dayOfWeek)

				if (selectedDay) {
					try {
						const response = await fetch(
							`/api/appointments?specialistId=${user?.userId}&date=${date}`
						)

						if (response.ok) {
							const appointments = await response.json()

							// Проверяем, что данные - это массив
							if (Array.isArray(appointments)) {
								const occupiedTimes = appointments.map(
									(appointment: { time: string }) => appointment.time
								)

								// Отфильтровываем только свободные временные интервалы
								const freeTimes = selectedDay.time.filter(
									time => !occupiedTimes.includes(time)
								)

								setAvailableTimes(freeTimes)
							} else {
								console.error(
									'Ответ от API не является массивом:',
									appointments
								)
								setAvailableTimes([]) // Если формат неверен, сбрасываем доступные интервалы
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
	}, [selectedDate, garfik])

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
			router.push('/')
		} catch (error) {
			console.error('Ошибка при перезаписи записи:', error)
		}
	}

	let bodyContent

	if (step === STEPS.DATE) {
		bodyContent = (
			<>
				<BackButton onClick={onBack} />
				<MainButton text='Перезаписать' onClick={handleSubmit} />

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
									<div className='grid grid-cols-4 gap-4 place-items-center text-sm'>
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
															: 'bg-gray-500 hover:bg-gray-300'
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

	return (
		<Container>
			<div>{bodyContent}</div>
		</Container>
	)
}

export default Perezapis
