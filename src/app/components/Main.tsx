'use client'

import { Avatar, Image, Spin } from 'antd'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
	FaBook,
	FaCalendarAlt,
	FaRegAddressCard,
	FaTelegramPlane,
	FaUsers,
} from 'react-icons/fa'
import { IoSettingsSharp } from 'react-icons/io5'
import { MdMenuBook, MdOutlineContactSupport } from 'react-icons/md'
import useTelegramUserProfile from '../hooks/useTelegramUserProfile'
import { AppRoot } from '@telegram-apps/telegram-ui'

import { IoIosArrowForward, IoMdAddCircleOutline } from 'react-icons/io'
import { GrTask } from 'react-icons/gr'
import { Icon28AddCircleOutline } from '@vkontakte/icons'
import BottomNav from './BottomNav'

interface MainProps {
	user: {
		id: number
		telegramId: string | null
		firstName: string | null
		lastName: string | null
		chatId: string | null
		username: string | null
		isMaster: boolean
		createdAt: Date
	} | null

	appointments: {
		id: number
		clientId: string
		firstName: string
		lastName: string
		specialistId: string
		date: string
		time: string
		serviceName: string | null
		serviceValuta: string | null
		phone: string
		specialistName: string | null
		specialistLastName: string | null
		specialistAddress: string | null
		specialistPrice: string | null
		specialistPhone: string | null
	}[]
}

const Main = ({ user, appointments }: MainProps) => {
	const { userPhoto, loading } = useTelegramUserProfile()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.MainButton.hide()
		tg.BackButton.hide()
	}, [])

	if (!user || loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<span className='text-lg font-medium'>
					<Spin size='large' />
				</span>
			</div>
		)
	}

	// Получаем только актуальные записи
	const activeAppointments = appointments.filter(app => {
		const [startTime] = app.time.split(' - ')
		const [day, month, year] = app.date.split('.').map(Number)
		const [hours, minutes] = startTime.split(':').map(Number)
		const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
		return appointmentDate > new Date()
	})

	// Получаем только две последние актуальные записи
	const recentAppointments = activeAppointments.slice(0, 2)

	const admin = user.chatId === '1312244058'

	const navigateTo = (path: string) => {
		router.push(path)
	}

	const masterMenuItems = [
		{
			icon: (
				<FaCalendarAlt
					size={32}
					className='bg-blue-500 p-1 rounded-lg'
					color='white'
				/>
			),
			label: 'Мой график',
			path: `/grafik/${user.telegramId}`,
		},
		{
			icon: (
				<GrTask
					size={32}
					className='bg-blue-500 p-1 rounded-lg'
					color='white'
				/>
			),
			label: 'Мои услуги',
			path: `/services/${user.telegramId}`,
		},
		{
			icon: (
				<IoSettingsSharp
					size={32}
					className='bg-blue-500 p-1 rounded-lg'
					color='white'
				/>
			),
			label: 'Мой профиль',
			path: `/profile/${user.telegramId}`,
		},
		{
			icon: (
				<MdMenuBook
					size={32}
					className='bg-blue-500 p-1 rounded-lg'
					color='white'
				/>
			),
			label: 'Записи ко мне',
			path: `/my_booking/${user.telegramId}`,
		},
	]

	const isActivePath = (path: string) => {
		return pathname?.includes(path.split('/').slice(0, -1).join('/'))
	}

	return (
		<>
			<AppRoot>
				<div className='min-h-screen pb-20' style={{ background: '#212121' }}>
					<div className='flex flex-row pl-4 items-center'>
						<div className='pt-4'>
							<Avatar src={'/logo.svg'} size={100} />
						</div>
						<div className='flex flex-col pt-2 pl-4'>
							<div>
								<span className='text-white text-2xl'>Назначь</span>
							</div>

							<div className='text-gray-500 text-md'>
								Мини-приложение для записи клиентов
							</div>
						</div>
					</div>
					<div className=' text-md pt-8 pb-4 flex justify-center items-center'>
						<div className='text-blue-500 flex'>
							<FaTelegramPlane size={24} />
							<a className='pl-2' href='https://t.me/+SAcWiscRdbBjMGUy'>
								Новости
							</a>
						</div>

						<div className='text-blue-500 flex pl-16'>
							<MdOutlineContactSupport size={24} />
							<span className='pl-2'>Поддержка</span>
						</div>
					</div>

					{user.isMaster && (
						<div className='p-4 mt-2  ' style={{ background: '#2c2c2c' }}>
							<div className='flex items-center'>
								<div>
									<FaRegAddressCard
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								</div>
								<div className='flex flex-col pl-4 text-white'>
									<span>Запись клиента</span>
									<span className='text-sm text-gray-500'>
										Запишите клиента к себе на услугу
									</span>
								</div>
							</div>
							<div
								className='mt-6 flex items-center cursor-pointer text-white'
								onClick={() => navigateTo(`/specZapis/${user.telegramId}`)}
							>
								<div className='bg-blue-500 pl-8 pr-8 pt-2 pb-2 rounded-lg flex items-center'>
									<Icon28AddCircleOutline />
									<span className='ml-4'>Записать</span>
								</div>
							</div>
						</div>
					)}

					{appointments.length === 0 ? (
						<div className='p-4 m-2 text-center'>
							<Image
								src='https://media.giphy.com/media/TqGcOed29VJdjkNyy6/giphy.gif'
								alt='Уточка'
								width={150}
								preview={false}
							/>
							<div className='text-white mt-4'>
								<p className='text-lg'>К вам нет записей</p>
								<p className='text-sm text-gray-400 mt-2'>
									{user?.isMaster
										? 'Запишите клиента сами или отправьте ссылку на ваш профиль'
										: 'Записывайтесь к специалистам через их профили'}
								</p>
								{user?.isMaster && (
									<div className='mt-4 text-blue-500'>
										<p>Ваша ссылка для записи:</p>
										<p className='text-sm mt-1'>
											https://t.me/naznach_twa_bot?start={user.telegramId}
										</p>
									</div>
								)}
							</div>
						</div>
					) : activeAppointments.length === 0 ? (
						<>
							<div className='p-4 m-2 text-center'>
								<Image
									src='https://media.giphy.com/media/TqGcOed29VJdjkNyy6/giphy.gif'
									alt='Уточка'
									width={150}
									preview={false}
								/>
								<div className='text-white mt-4'>
									<p className='text-lg'>Нет актуальных записей</p>
									<p className='text-sm text-gray-400 mt-2'>
										{user?.isMaster
											? 'Все записи завершены'
											: 'У вас нет предстоящих записей'}
									</p>
								</div>
							</div>
							<div
								className='mt-4 text-center'
								onClick={() =>
									router.push(
										user.isMaster
											? `/my_booking/${user.telegramId}`
											: `/my_list/${user.telegramId}`
									)
								}
							>
								<button className='bg-blue-500 text-white px-6 py-2 rounded-lg'>
									Показать все записи ({appointments.length})
								</button>
							</div>
						</>
					) : (
						<div className='pl-4 pt-4 m-2'>
							<div className='text-white mb-4'>
								<h2 className='text-xl font-semibold'>
									{user?.isMaster
										? 'Последние записи ко мне'
										: 'Мои последние записи'}
								</h2>
							</div>
							<div className='space-y-4'>
								{recentAppointments.map(app => {
									const [startTime, endTime] = app.time.split(' - ')
									const [day, month, year] = app.date.split('.').map(Number)
									const [hours, minutes] = startTime.split(':').map(Number)
									const appointmentDate = new Date(
										year,
										month - 1,
										day,
										hours,
										minutes,
										0,
										0
									)

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

									return (
										<div key={app.id}>
											<div className='pl-4 text-xl font-semibold text-white'>
												{`${day} ${months[month - 1]}`}
											</div>
											<div className='pt-4'>
												<div
													className='rounded-lg ml-4 mr-4 pt-2 pb-2 border-l-4 border-green-500 flex items-center justify-between'
													style={{
														backgroundColor: `#2c2c2c`,
													}}
												>
													<div>
														<div className='pl-4 font-bold text-blue-500'>
															{app.time}
														</div>
														<div className='pl-4 text-sm font-bold text-white'>
															{user?.isMaster
																? `${app.firstName} ${app.lastName}`
																: `${app.specialistName} ${app.specialistLastName}`}
														</div>
														<div className='pl-4 text-xs font-normal text-blue-500'>
															{user?.isMaster ? app.phone : app.specialistPhone}
														</div>
														<div className='pl-4 w-95 text-xs break-words text-white'>
															{app.serviceName}
														</div>
														<div className='pl-4 text-sm text-blue-500'>
															{app.specialistPrice} {app.serviceValuta}
														</div>
													</div>
												</div>
											</div>
										</div>
									)
								})}
							</div>

							<div
								className='mt-8 text-center'
								onClick={() =>
									router.push(
										user.isMaster
											? `/my_booking/${user.telegramId}`
											: `/my_list/${user.telegramId}`
									)
								}
							>
								<button className='bg-blue-500 text-white px-6 py-2 rounded-lg'>
									Показать все записи ({appointments.length})
								</button>
							</div>
						</div>
					)}
				</div>
				{user?.telegramId && (
					<BottomNav isMaster={user.isMaster} userId={user.telegramId} />
				)}
			</AppRoot>
		</>
	)
}

export default Main
