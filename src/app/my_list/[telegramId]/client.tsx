'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	Button,
	Cell,
	Headline,
	IconContainer,
	List,
	Modal,
	Placeholder,
	Section,
} from '@telegram-apps/telegram-ui'
import { Avatar, DatePicker, Image, Input } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { CiCalendarDate } from 'react-icons/ci'
import { FaRegEdit } from 'react-icons/fa'
import { LuCalendarPlus } from 'react-icons/lu'
import locale from 'antd/es/date-picker/locale/ru_RU'
import dayjs, { Dayjs } from 'dayjs'
import {
	MdOutlineDateRange,
	MdOutlineAccessTime,
	MdOutlineAttachMoney,
	MdPerson,
	MdPhone,
	MdLocationOn,
	MdCategory,
	MdOutlineCancel,
	MdMoreTime,
	MdOutlinePhoneIphone,
	MdArrowForwardIos,
	MdChecklist,
	MdDeleteForever,
} from 'react-icons/md'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { Icon28Dismiss } from '@vkontakte/icons'
import { GrMoney, GrUser } from 'react-icons/gr'
import { newDate } from 'react-datepicker/dist/date_utils'

interface MyAppointmentlistProps {
	appointment:
		| {
				id: number
				clientId: string
				firstName: string
				lastName: string
				specialistId: string
				date: string
				time: string
				phone: string
				serviceName: string | null
				serviceValuta: string | null
				specialistName: string | null
				specialistLastName: string | null
				specialistAddress: string | null
				specialistPrice: string | null
				specialistPhone: string | null
		  }[]
		| null

	user: string
}

const MyAppointmentlist: React.FC<MyAppointmentlistProps> = ({
	appointment,
	user,
}) => {
	const router = useRouter()
	const { telegram_user, userPhoto } = useTelegramUserProfile()
	const [clientAppointments, setClientAppointments] = useState(
		appointment || []
	)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [cancelReason, setCancelReason] = useState('')
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<
		number | null
	>(null)
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
	const [filteredAppointments, setFilteredAppointments] =
		useState(clientAppointments)

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show()
		tg.BackButton.onClick(() => router.push('/'))
		tg.MainButton.hide()

		// Выполнение на клиенте: переворачиваем массив
		if (appointment && appointment.length > 0) {
			const filtered = appointment.filter(
				app => app.clientId !== app.specialistId
			)
			setClientAppointments([...filtered].reverse())
			setFilteredAppointments([...filtered].reverse())
		}
	}, [appointment])

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
					setIsModalVisible(false) // Закрываем модальное окно после успешного удаления
				} else {
					toast.error('Не удалось отменить запись')
				}
			} catch (error) {
				console.error('Ошибка при отмене записи:', error)
				toast.error('Произошла ошибка при отмене записи')
			}
		}
	}

	useEffect(() => {
		if (selectedDate) {
			const filtered = clientAppointments.filter(app =>
				dayjs(app.date, 'DD.MM.YYYY').isSame(dayjs(selectedDate), 'day')
			)
			setFilteredAppointments(filtered)
		} else {
			setFilteredAppointments(clientAppointments)
		}
	}, [selectedDate, clientAppointments])

	const openCancelModal = (appointmentId: number) => {
		setSelectedAppointmentId(appointmentId)
		setCancelReason('') // Сбрасываем причину при каждом новом открытии модального окна
		setIsModalVisible(true)
	}

	const groupedAppointments = filteredAppointments.reduce((acc, app) => {
		const date = app.date

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

	const renderAppointments = Object.keys(groupedAppointments).map(date => {
		const [day, month] = date.split('.')
		const monthName = months[parseInt(month, 10) - 1]

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
					const [startTime, endTime] = app.time.split(' - ')

					const convertToDate = (dateString: string, timeString: string) => {
						const [day, month, year] = dateString.split('.').map(Number)
						const [hours, minutes] = timeString.split(':').map(Number)
						const date = new Date(year, month - 1, day, hours, minutes, 0, 0) // month - 1, так как месяц в JavaScript начинается с 0
						return date
					}
					const startDate = convertToDate(date, startTime)
					const endDate = convertToDate(date, endTime)

					const now = new Date()

					const isPastAppointment = now > endDate

					return (
						<>
							<div key={app.id} className='pt-4'>
								<div>
									<div
										className={`rounded-lg ml-4 mr-4 pt-2 pb-2 border-l-4 flex items-center justify-between ${
											isPastAppointment ? 'border-red-500' : 'border-green-500'
										}`}
										style={{
											backgroundColor: `var(--tg-theme-secondary-bg-color)`,
										}}
									>
										<div>
											<div className='pl-4 font-bold text-blue-500'>
												{app.time}
											</div>
											<div className='pl-4 text-sm font-bold'>
												{app.specialistName} {app.specialistLastName}
											</div>
											<div className='pl-4 text-xs font-normal text-blue-500'>
												{app.specialistPhone}
											</div>
											<div className='pl-4 w-95 text-xs break-words'>
												{app.serviceName}
											</div>
											<div className='pl-4 text-sm text-blue-500'>
												{app.specialistPrice} {app.serviceValuta}
											</div>
										</div>
										<div className='pr-4'>
											<div>
												<FaRegEdit
													size={32}
													className='bg-green-500 p-1 rounded-lg mb-2'
													color='white'
													onClick={() => router.push(`/perezapis/${app.id}`)}
												/>
											</div>
											<Modal
												header={<ModalHeader></ModalHeader>}
												trigger={
													<div className='flex justify-center'>
														<button onClick={() => openCancelModal(app.id)}>
															<div className='flex items-center'>
																<MdDeleteForever
																	size={32}
																	className='bg-red-500 p-1 rounded-lg'
																	color='white'
																/>
															</div>
														</button>
													</div>
												}
											>
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
														}}
													/>

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
											</Modal>
										</div>
									</div>
								</div>
							</div>
							<></>
						</>
					)
				})}
			</div>
		)
	})

	return (
		<>
			<ToastContainer />

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
					<Headline weight='2'>Мои записи</Headline>
				</Cell>
				<div className=' p-4'>
					<DatePicker
						locale={locale}
						onChange={date => setSelectedDate(date)}
						placeholder='Выберите дату'
						format={'DD.MM.YYYY'}
						style={{ width: '100%' }}
					/>
					<div className='flex items-center justify-evenly mt-4 '>
						<div className='border-l-4 pl-2 border-green-500 text-xs'>
							Актуальная запись
						</div>
						<div className='border-l-4 pl-2 border-red-500 text-xs'>
							Прошедшая запись
						</div>
					</div>
				</div>
			</Section>

			<List>
				<div>{renderAppointments}</div>
			</List>
		</>
	)
}

export default MyAppointmentlist
