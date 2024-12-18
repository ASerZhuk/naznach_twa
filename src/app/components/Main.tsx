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
			<Section className='pt-2 pb-2'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={150} src='/logo.svg' alt='Логотип' />}
				>
					{user.firstName}
				</Cell>
			</Section>

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
				<List style={{ padding: 10 }}>
					<Section>
						<Cell
							before={
								<FaRegAddressCard
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							}
							subtitle='Запишите клиента к себе на услугу'
						>
							Запись клиента
						</Cell>
						<ButtonCell
							before={<Icon28AddCircleOutline />}
							interactiveAnimation='opacity'
							mode='default'
							onClick={() => navigateTo(`/specZapis/${user.telegramId}`)}
						>
							Записать
						</ButtonCell>
					</Section>
				</List>
			)}

			<List>
				<Section header='Основное меню'>
					{user.isMaster &&
						masterMenuItems.map(item => (
							<Link key={item.label} href={item.path}>
								<Cell
									key={item.label}
									before={<IconContainer>{item.icon}</IconContainer>}
									after={
										<IconContainer>
											<IoIosArrowForward />
										</IconContainer>
									}
								>
									{item.label}
								</Cell>
							</Link>
						))}
					<Link href={`/my_specialist/${user.telegramId}`}>
						<Cell
							before={
								<IconContainer>
									<FaUsers
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								</IconContainer>
							}
							after={
								<IconContainer>
									<IoIosArrowForward />
								</IconContainer>
							}
						>
							Мои специалисты
						</Cell>
					</Link>
					<Link href={`/my_list/${user.telegramId}`}>
						<Cell
							before={
								<IconContainer>
									<FaBook
										size={32}
										className='bg-blue-500 p-1 rounded-lg'
										color='white'
									/>
								</IconContainer>
							}
							after={
								<IconContainer>
									<IoIosArrowForward />
								</IconContainer>
							}
							onClick={() => navigateTo(`/my_list/${user.telegramId}`)}
						>
							Мои записи
						</Cell>
					</Link>
				</Section>

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
			</List>
		</>
	)
}

export default Main
