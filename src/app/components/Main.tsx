'use client'

import { Avatar, Image, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
	FaBook,
	FaCalendarAlt,
	FaRegAddressCard,
	FaUsers,
} from 'react-icons/fa'
import { IoSettingsSharp } from 'react-icons/io5'
import { MdMenuBook } from 'react-icons/md'
import useTelegramUserProfile from '../hooks/useTelegramUserProfile'
import {
	AppRoot,
	Banner,
	Button,
	ButtonCell,
	Cell,
	FixedLayout,
	IconContainer,
	List,
	Section,
} from '@telegram-apps/telegram-ui'
import { Icon28AddCircleOutline } from '@vkontakte/icons'
import { IoIosArrowForward } from 'react-icons/io'
import { TabbarItem } from '@telegram-apps/telegram-ui/dist/components/Layout/Tabbar/components/TabbarItem/TabbarItem'
import Link from 'next/link'
import { GrTask } from 'react-icons/gr'

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
	}
}

const Main = ({ user }: MainProps) => {
	const { userPhoto, loading } = useTelegramUserProfile()
	const router = useRouter()

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

	return (
		<>
			<AppRoot>
				<div
					className='flex items-center justify-between pb-2 pt-2'
					style={{ background: `var(--tg-theme-bg-color)` }}
				>
					<div className='pl-4'>
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
						<span
							style={{ color: `var(--tg-theme-text-color)` }}
							className='pl-2'
						>
							{user?.firstName}
						</span>
					</div>
					<div className='pr-4'>
						<Image width={35} src='/logo.svg' alt='Логотип' />
					</div>
				</div>

				<Banner
					background={
						<img
							alt='Nasa streams'
							src='https://files.tecnoblog.net/wp-content/uploads/2019/06/telegram-001-700x394.jpg'
							style={{ width: '150%' }}
						/>
					}
					header='Новости приложения'
					subheader='Канал с информацией об обновлениях'
					type='section'
				>
					<Button mode='white' size='s'>
						<a className='text-black' href='https://t.me/+SAcWiscRdbBjMGUy'>
							Подписаться
						</a>
					</Button>
				</Banner>

				{/* Блок "Запись клиента" для мастеров */}
				{user.isMaster && (
					<>
						<div
							style={{ background: `var(--tg-theme-section-bg-color)` }}
							className='p-4 m-2 shadow-md'
						>
							<div className='flex items-center'>
								<div>
									<FaRegAddressCard
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								</div>
								<div className='flex flex-col pl-4'>
									<span>Запись клиента</span>
									<span
										className='text-sm'
										style={{ color: `var(--tg-theme-subtitle-text-color)` }}
									>
										Запишите клиента к себе на услугу
									</span>
								</div>
							</div>
							<div
								className='mt-6 flex items-center cursor-pointer'
								style={{ color: `var(--tg-theme-link-color)` }}
								onClick={() => navigateTo(`/specZapis/${user.telegramId}`)}
							>
								<Icon28AddCircleOutline />
								<span className='ml-4'>Записать</span>
							</div>
						</div>
					</>
				)}

				<div
					className='pl-4 pt-2 pb-2'
					style={{ background: `var(--tg-theme-section-bg-color)` }}
				>
					<div
						style={{ color: `var(--tg-theme-link-color)` }}
						className='text-sm font-semibold'
					>
						Основное меню
					</div>
					{user.isMaster &&
						masterMenuItems.map(item => (
							<div
								className='flex items-center justify-between pt-6'
								onClick={() => navigateTo(`${item.path}`)}
							>
								<div className='flex items-center'>
									<div>{item.icon}</div>
									<div className='pl-6'>{item.label}</div>
								</div>
								<div
									className='pr-4'
									style={{ color: `var(--tg-theme-link-color)` }}
								>
									<IoIosArrowForward />
								</div>
							</div>
						))}
					<div
						className='flex items-center justify-between pt-6'
						onClick={() => navigateTo(`/my_specialist/${user.telegramId}`)}
					>
						<div className='flex items-center'>
							<div>
								<FaUsers
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							</div>
							<div className='pl-6'>Мои специалисты</div>
						</div>
						<div
							className='pr-4'
							style={{ color: `var(--tg-theme-link-color)` }}
						>
							<IoIosArrowForward />
						</div>
					</div>
					<div
						className='flex items-center justify-between pt-6'
						onClick={() => navigateTo(`/my_list/${user.telegramId}`)}
					>
						<div className='flex items-center'>
							<div>
								<FaBook
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							</div>
							<div className='pl-6'>Мои записи</div>
						</div>
						<div
							className='pr-4'
							style={{ color: `var(--tg-theme-link-color)` }}
						>
							<IoIosArrowForward />
						</div>
					</div>
				</div>

				<FixedLayout>
					<div className='flex flex-row justify-center'>
						<TabbarItem>
							<a
								className='text-sm'
								href='https://teletype.in/@naznach/6B0k92xeYUm'
							>
								Инструкция
							</a>
						</TabbarItem>
						<TabbarItem>
							<a className='text-sm' href='https://t.me/aser_zhuk'>
								Обратная связь
							</a>
						</TabbarItem>
						{admin && (
							<Link href={`/admin`}>
								<TabbarItem>
									<div className='text-sm'>Админка</div>
								</TabbarItem>
							</Link>
						)}
					</div>
				</FixedLayout>
			</AppRoot>
		</>
	)
}

export default Main
