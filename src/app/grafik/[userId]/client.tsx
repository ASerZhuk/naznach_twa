'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'

import { Icon28AddCircleOutline } from '@vkontakte/icons'
import { Avatar, Image, Spin, Input } from 'antd'
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
				dayOfWeek: number
				id?: number
		  }[]
		| null
}

interface Grafik {
	grafikName: string
	specialistId: string | undefined
	startTime: string
	endTime: string
	selectedDays: number[]
	id?: number
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
	const { telegram_user, userPhoto } = useTelegramUserProfile()

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
			<div className='flex flex-col'>
				<div
					className='flex p-4 items-center mt-2'
					style={{ background: `var(--tg-theme-section-bg-color)` }}
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
							Мой график
						</div>
						<div
							style={{ color: `var(--tg-theme-subtitle-text-color)` }}
							className='text-sm'
						>
							Добавляйте и удаляйте график работы
						</div>
					</div>
				</div>
				<div>
					<div
						className='mt-2 pt-2'
						style={{ background: `var(--tg-theme-section-bg-color)` }}
					>
						{grafikList.map((grafik, index) => (
							<form
								key={index}
								onSubmit={e => handleSubmit(e, index)}
								className='mb-6'
							>
								<div className='flex flex-col mb-4 pl-4 pr-4'>
									<label className='pb-2'>Начало работы</label>
									<Input
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
										className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
										style={{
											background: `var(--tg-theme-section-bg-color)`,
											color: `var(--tg-theme-text-color)`,
										}}
									/>
								</div>
								<div className='flex flex-col mb-4 pl-4 pr-4'>
									<label className='pb-2'>Конец работы</label>
									<Input
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
										className='border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
										style={{
											background: `var(--tg-theme-section-bg-color)`,
											color: `var(--tg-theme-text-color)`,
										}}
									/>
								</div>
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
						<div
							className='mt-6 pl-4 pb-4 flex items-center cursor-pointer'
							style={{ color: `var(--tg-theme-link-color)` }}
							onClick={handleAddNewGrafik}
						>
							<Icon28AddCircleOutline />
							<span className='ml-4'>Добавить график работы</span>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default TimeSlotPickerComponent
