'use client'

import useTelegramUserProfile from '@/app/hooks/useTelegramUserProfile'
import { Avatar, Image, DatePicker, Select } from 'antd'
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
} from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './calendar.css'
import {
	Blockquote,
	Button,
	ButtonCell,
	Cell,
	Headline,
	IconContainer,
	Input,
	List,
	Modal,
	Placeholder,
	Section,
} from '@telegram-apps/telegram-ui'
import { LuCalendarPlus } from 'react-icons/lu'
import { CiCalendarDate } from 'react-icons/ci'
import { GrMoney, GrUser } from 'react-icons/gr'
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
				</div>
			</Section>

			<List>
				{filteredAppointments && filteredAppointments.length > 0 ? (
					filteredAppointments.map(app => (
						<Section key={app.id} className='mt-4'>
							{app.clientId === app.specialistId && (
								<div className=' pr-2 pt-2 pb-2 flex justify-end items-center'>
									<div className='pr-2 text-red-500 text-xs'>
										Запись сделана вами
									</div>
									<FaUserAltSlash
										size={24}
										className='bg-red-500 rounded-lg p-1'
										color='white'
									/>
								</div>
							)}
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
							<Cell
								before={
									<IconContainer>
										<MdChecklist
											size={32}
											className='bg-blue-500 rounded-lg p-1'
											color='white'
										/>
									</IconContainer>
								}
								after={<div className='text-blue-500'>{app.serviceName}</div>}
							>
								Услуга
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
								after={
									<div className='text-blue-500'>
										{app.specialistPrice} руб.
									</div>
								}
							>
								К оплате
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
										{app.firstName} {app.lastName}
									</div>
								}
							>
								Имя клиента
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
								after={<div className='text-blue-500'>{app.phone}</div>}
							>
								Телефон
							</Cell>

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
								{!writeSpec ? (
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
													onClick={() =>
														openCancelModal(
															app.id,
															app.clientId,
															app.specialistId,
															app.date,
															app.time,
															app.specialistName,
															app.specialistLastName,
															app.specialistPhone
														)
													}
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

											<Button
												className=' ml-4 mr-4 mb-8'
												size='m'
												onClick={handleCancel}
											>
												Подтвердить
											</Button>
										</div>
									</Modal>
								) : (
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
													onClick={() =>
														openCancelModal(
															app.id,
															app.clientId,
															app.specialistId,
															app.date,
															app.time,
															app.specialistName,
															app.specialistLastName,
															app.specialistPhone
														)
													}
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

											<div>
												<Blockquote className='flex flex-col' type='text'>
													<div>Автоматическое сообщение клиенту:</div>
													<div className='mt-2'>
														Ваша запись на {app.date} в {app.time} к мастеру{' '}
														{app.specialistName} {app.specialistLastName}{' '}
														отменена. Причина: {cancelReason}. Телефон для
														связи: {app.specialistPhone}. Уведомление из
														приложения:{' '}
														<a href='https://t.me/naznach_twa_bot'>
															https://t.me/naznach_twa_bot
														</a>
													</div>
												</Blockquote>
											</div>

											<div
												onClick={handleCancel}
												className='flex mt-4 mb-3 ml-6'
											>
												<FaTelegramPlane size={24} color='#3b82f6' />
												<a
													href={`https://t.me/${
														app.phone
													}?text=${encodeURIComponent(messageData)}`}
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
												}}
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
									</Modal>
								)}
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

export default MySpecialBooking
