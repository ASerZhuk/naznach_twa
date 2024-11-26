'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import {
	Button,
	Cell,
	Headline,
	IconContainer,
	Input,
	List,
	Modal,
	Placeholder,
	Section,
} from '@telegram-apps/telegram-ui'
import { Avatar, DatePicker, Image } from 'antd'
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
} from 'react-icons/md'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader'
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose'
import { Icon28Dismiss } from '@vkontakte/icons'

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
				specialistName: string | null
				specialistLastName: string | null
				specialistAddress: string | null
				specialistPrice: string | null
				specialistPhone: string | null
				specialistCategory: string | null
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
			setClientAppointments([...appointment].reverse())
			setFilteredAppointments([...appointment].reverse())
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

	return (
		<>
			<ToastContainer />

			<Section className='pt-2 pb-4'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={150} src='/logo.svg' alt='Логотип' />}
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
				</div>
			</Section>

			<List>
				{filteredAppointments && filteredAppointments.length > 0 ? (
					filteredAppointments.map(app => (
						<Section key={app.id} className='mt-4'>
							{/* Информация о записи (время, дата, цена, категория) */}

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
								after={<div className='text-blue-500'>{app.date}</div>}
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
								after={<div className='text-blue-500'>{app.time}</div>}
							>
								Время записи
							</Cell>
							{app.specialistPrice && (
								<Cell
									before={
										<IconContainer>
											<MdOutlineAttachMoney
												size={32}
												className='bg-blue-500 rounded-lg p-1'
												color='white'
											/>
										</IconContainer>
									}
									after={
										<div className='text-blue-500'>
											{app.specialistPrice} руб.
										</div>
									}
								>
									Стоимость услуги
								</Cell>
							)}
							{app.specialistCategory && (
								<Cell
									before={
										<IconContainer>
											<MdCategory
												size={32}
												className='bg-blue-500 rounded-lg p-1'
												color='white'
											/>
										</IconContainer>
									}
									after={
										<div className='text-blue-500'>
											{app.specialistCategory}
										</div>
									}
								>
									Категория
								</Cell>
							)}

							{/* Информация о мастере */}
							{user !== app.specialistId ? (
								<Cell
									before={
										<IconContainer>
											<MdPerson
												size={32}
												className='bg-blue-500 rounded-lg p-1'
												color='white'
											/>
										</IconContainer>
									}
									after={
										<div className='text-blue-500'>
											{app.specialistName} {app.specialistLastName}
										</div>
									}
								>
									Мастер
								</Cell>
							) : (
								<Cell
									before={
										<IconContainer>
											<MdPerson
												size={32}
												className='bg-blue-500 rounded-lg p-1'
												color='white'
											/>
										</IconContainer>
									}
									after={
										<div className='text-blue-500'>
											{app.firstName} {app.lastName}
										</div>
									}
								>
									Клиент
								</Cell>
							)}
							<Cell
								before={
									<IconContainer>
										<MdPhone
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={
									<div className='text-blue-500'>{app.specialistPhone}</div>
								}
							>
								Телефон
							</Cell>

							{app.specialistAddress && (
								<Cell
									before={
										<IconContainer>
											<MdLocationOn
												size={32}
												className='bg-blue-500 rounded-lg p-1'
												color='white'
											/>
										</IconContainer>
									}
									after={
										<div className='text-blue-500'>{app.specialistAddress}</div>
									}
								>
									Адрес
								</Cell>
							)}

							<div className='flex flex-row p-4 justify-between'>
								<div className='text-center pt-2'>
									<button
										onClick={() => router.push(`/perezapis/${app.id}`)}
										className='bg-blue-500 rounded-full px-5 py-3  text-white text-sm'
									>
										<div className='flex items-center'>
											<FaRegEdit className='mr-2' />
											Перезаписать
										</div>
									</button>
								</div>
								<Modal
									header={
										<ModalHeader
											after={
												<ModalClose>
													<Icon28Dismiss
														style={{ color: 'var(--tgui--plain_foreground)' }}
													/>
												</ModalClose>
											}
										></ModalHeader>
									}
									trigger={
										<div className='text-center pt-2'>
											<button
												onClick={() => openCancelModal(app.id)}
												className='bg-red-500 rounded-full px-9 py-3  text-white text-sm'
											>
												<div className='flex items-center'>
													<MdOutlineCancel className='mr-2' />
													Отменить
												</div>
											</button>
										</div>
									}
								>
									<div className='flex flex-col justify-center'>
										<Input
											header='Причина отмены'
											value={cancelReason}
											onChange={e => setCancelReason(e.target.value)}
											placeholder='Сегодня не работаю'
											status='focused'
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
						</Section>
					))
				) : (
					<div className='HIJtihMA8FHczS02iWF5'>
						<Placeholder header='Записей нет'>
							<img
								alt='Telegram sticker'
								className='blt0jZBzpxuR4oDhJc8s'
								src='https://media.giphy.com/media/TqGcOed29VJdjkNyy6/giphy.gif'
								width='50%'
							/>
						</Placeholder>
					</div>
				)}
			</List>
		</>
	)
}

export default MyAppointmentlist
