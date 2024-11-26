'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	Button,
	ButtonCell,
	Cell,
	Headline,
	Input,
	LargeTitle,
	List,
	Section,
	Select,
} from '@telegram-apps/telegram-ui'
import { Icon28AddCircleOutline } from '@vkontakte/icons'
import { Avatar, Image } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuCalendarPlus } from 'react-icons/lu'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface TimeSlotPickerComponentProps {
	specialistId: string | undefined
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

interface Grafik {
	grafikName: string
	specialistId: string | undefined
	startTime: string
	endTime: string
	interval: number
	selectedDays: number[]
	id?: number
	time?: string[]
}

const TimeSlotPickerComponent: React.FC<TimeSlotPickerComponentProps> = ({
	specialistId,
	grafik,
}) => {
	// Группировка графиков по времени и интервалу
	const groupGrafiks = (grafik: any) => {
		const groupedGrafik: Grafik[] = []
		const grafikMap = new Map()

		grafik?.forEach((g: any) => {
			const key = `${g.startTime}-${g.endTime}-${g.interval}`
			if (!grafikMap.has(key)) {
				grafikMap.set(key, {
					grafikName: `grafik_${g.dayOfWeek}_${Date.now()}`,
					specialistId: g.specialistId,
					startTime: g.startTime,
					endTime: g.endTime,
					interval: g.interval,
					selectedDays: [g.dayOfWeek],
					id: g.id,
				})
			} else {
				const existingGrafik = grafikMap.get(key)
				existingGrafik.selectedDays.push(g.dayOfWeek)
			}
		})

		grafikMap.forEach((value: any) => groupedGrafik.push(value))
		return groupedGrafik
	}

	const [grafikList, setGrafikList] = useState<Grafik[]>(
		grafik
			? groupGrafiks(grafik)
			: [
					{
						grafikName: `grafik_1_${Date.now()}`,
						specialistId,
						startTime: '00:00',
						endTime: '00:00',
						interval: 15,
						selectedDays: [],
					},
			  ]
	)

	const [grafikCounter, setGrafikCounter] = useState(2)

	// Дни недели
	const daysOfWeek = [
		{ label: 'ПН', value: 1 },
		{ label: 'ВТ', value: 2 },
		{ label: 'СР', value: 3 },
		{ label: 'ЧТ', value: 4 },
		{ label: 'ПТ', value: 5 },
		{ label: 'СБ', value: 6 },
		{ label: 'ВС', value: 0 },
	]

	// Обработчик выбора дня недели с проверкой на дублирование
	const toggleDaySelection = (grafikIndex: number, dayValue: number) => {
		// Проверяем, был ли этот день уже выбран в других графиках
		const isDayAlreadySelected = grafikList.some((g, i) =>
			i !== grafikIndex ? g.selectedDays.includes(dayValue) : false
		)

		if (isDayAlreadySelected) {
			toast.error('Этот день уже добавлен в другой график!')
			return
		}

		setGrafikList(prevGrafikList =>
			prevGrafikList.map((grafik, index) => {
				if (index === grafikIndex) {
					const updatedDays = grafik.selectedDays.includes(dayValue)
						? grafik.selectedDays.filter(day => day !== dayValue)
						: [...grafik.selectedDays, dayValue]
					return { ...grafik, selectedDays: updatedDays }
				}
				return grafik
			})
		)
	}

	// Обработка отправки формы
	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
		grafikIndex: number
	) => {
		e.preventDefault()
		const grafikData = grafikList[grafikIndex]

		if (grafikData.selectedDays.length === 0) {
			toast.error('Пожалуйста, выберите хотя бы один день недели.')
			return
		}

		const response = await fetch('/api/grafik', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				grafikName: grafikData.grafikName,
				startTime: grafikData.startTime,
				endTime: grafikData.endTime,
				interval: grafikData.interval,
				specialistId,
				daysOfWeek: grafikData.selectedDays,
			}),
		})

		if (response.ok) {
			toast.success('График успешно сохранён')
			setTimeout(() => {
				router.replace('/')
			}, 1000)
		} else {
			toast.error('Ошибка при создании графика')
		}
	}

	// Обработка удаления графика
	const handleDelete = async (grafikIndex: number) => {
		const grafikData = grafikList[grafikIndex]

		const response = await fetch('/api/grafik', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: grafikData.id,
				specialistId,
				daysOfWeek: grafikData.selectedDays,
			}),
		})

		if (response.ok) {
			toast.success('График успешно удалён')
			setGrafikList(prevGrafikList =>
				prevGrafikList.filter((_, index) => index !== grafikIndex)
			)
		} else {
			toast.error('Ошибка при удалении графика')
		}
	}

	// Обработка добавления нового графика
	const handleAddNewGrafik = () => {
		const newGrafikName = `grafik_${grafikCounter}_${Date.now()}`
		setGrafikList(prevGrafikList => [
			...prevGrafikList,
			{
				grafikName: newGrafikName,
				specialistId,
				startTime: '00:00',
				endTime: '00:00',
				interval: 15,
				selectedDays: [],
			},
		])
		setGrafikCounter(grafikCounter + 1)
	}

	const router = useRouter()
	const { telegram_user, userPhoto, loading, error } = useTelegramUserProfile()

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
			<Section className='pt-2'>
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
							<LuCalendarPlus
								size={32}
								className='bg-blue-500 p-1 rounded-lg'
								color='white'
							/>
						}
						subtitle='Добавляйте и удаляйте график работы'
					>
						<Headline weight='2'>Мой график</Headline>
					</Cell>
					{grafikList.map((grafik, index) => (
						<form
							key={index}
							onSubmit={e => handleSubmit(e, index)}
							className='mb-6'
						>
							<Input
								status='focused'
								header='Время начала работы'
								id={`start-time-${index}`}
								type='time'
								value={grafik.startTime}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index ? { ...g, startTime: e.target.value } : g
										)
									)
								}
							/>
							<Input
								status='focused'
								header='Время окончания работы'
								id={`end-time-${index}`}
								type='time'
								value={grafik.endTime}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index ? { ...g, endTime: e.target.value } : g
										)
									)
								}
							/>
							<Select
								status='focused'
								header='Время на клиента'
								id={`interval-${index}`}
								value={grafik.interval}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index
												? { ...g, interval: Number(e.target.value) }
												: g
										)
									)
								}
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
							</Select>
							<div className='flex justify-evenly mt-6 text-sm '>
								{daysOfWeek.map(day => (
									<button
										key={day.value}
										type='button'
										className={`py-1 px-2 rounded-md transition-colors ${
											grafik.selectedDays.includes(day.value)
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700'
										}`}
										onClick={() => toggleDaySelection(index, day.value)}
									>
										{day.label}
									</button>
								))}
							</div>
							<div className='mt-6 flex flex-col p-4'>
								{!grafik.id ? (
									<button
										type='submit'
										className=' bg-blue-500 text-white py-4 px-4 rounded-md hover:bg-blue-500 transition-colors text-sm mb-4'
									>
										Сохранить
									</button>
								) : (
									<div></div>
								)}
								<button
									type='button'
									onClick={() => handleDelete(index)}
									className=' bg-red-600 text-white py-4 px-4 rounded-md hover:bg-red-700 transition-colors text-sm'
								>
									Удалить
								</button>
							</div>
						</form>
					))}
					<ButtonCell
						before={<Icon28AddCircleOutline />}
						interactiveAnimation='background'
						onClick={handleAddNewGrafik}
					>
						Добавить график работы
					</ButtonCell>
				</Section>
			</List>

			{/*<div className='max-w-md mx-auto bg-white shadow-md rounded-lg p-6 '>
				<div className=' border-b pb-4'>
					<h2 className='text-xl font-normal pb-2 '>Мой график</h2>
					<span className=' text-sm'>
						Добавляйте и удаляйте график на разные дни недели{' '}
					</span>
				</div>

				
				<ToastContainer />

				{grafikList.map((grafik, index) => (
					<form
						key={index}
						onSubmit={e => handleSubmit(e, index)}
						className='mb-6'
					>
						
						<div className='mb-4'>
							<label
								htmlFor={`start-time-${index}`}
								className='block text-sm font-medium text-gray-700 mt-6 mb-2'
							>
								Начало работы:
							</label>
							<input
								id={`start-time-${index}`}
								type='time'
								value={grafik.startTime}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index ? { ...g, startTime: e.target.value } : g
										)
									)
								}
								className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
								required
							/>
						</div>

						<div className='mb-4'>
							<label
								htmlFor={`end-time-${index}`}
								className='block text-sm font-medium text-gray-700 mb-2'
							>
								Конец работы:
							</label>
							<input
								id={`end-time-${index}`}
								type='time'
								value={grafik.endTime}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index ? { ...g, endTime: e.target.value } : g
										)
									)
								}
								className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
								required
							/>
						</div>

						<div className='mb-4'>
							<label
								htmlFor={`interval-${index}`}
								className='block text-sm font-medium text-gray-700 mb-2'
							>
								Время на клиента (минуты):
							</label>
							<select
								id={`interval-${index}`}
								value={grafik.interval}
								onChange={e =>
									setGrafikList(prevGrafikList =>
										prevGrafikList.map((g, i) =>
											i === index
												? { ...g, interval: Number(e.target.value) }
												: g
										)
									)
								}
								className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
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
							</select>
						</div>

						
						<div className='flex justify-between mt-6 text-sm'>
							{daysOfWeek.map(day => (
								<button
									key={day.value}
									type='button'
									className={`py-1 px-2 rounded-md transition-colors ${
										grafik.selectedDays.includes(day.value)
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-700'
									}`}
									onClick={() => toggleDaySelection(index, day.value)}
								>
									{day.label}
								</button>
							))}
						</div>

						
						<div className='mt-6 flex space-x-4'>
							<button
								type='submit'
								className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition-colors text-sm'
							>
								Сохранить
							</button>
							<button
								type='button'
								onClick={() => handleDelete(index)}
								className='w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm'
							>
								Удалить
							</button>
						</div>
					</form>
				))}

				<div className='mt-6 flex justify-center'>
					<button
						type='button'
						onClick={handleAddNewGrafik}
						className='bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm'
					>
						+ Добавить график
					</button>
				</div>
			</div>*/}
		</>
	)
}

export default TimeSlotPickerComponent
