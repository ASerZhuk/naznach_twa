'use client'

import { Avatar, Carousel, Image, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
	FaBook,
	FaCalendarAlt,
	FaRegAddressCard,
	FaUserPlus,
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
	Tabbar,
} from '@telegram-apps/telegram-ui'
import {
	Icon28AddCircleOutline,
	Icon28BillheadOutline,
	Icon28CalendarOutline,
} from '@vkontakte/icons'
import { IoIosArrowForward, IoMdAddCircleOutline } from 'react-icons/io'
import { TabbarItem } from '@telegram-apps/telegram-ui/dist/components/Layout/Tabbar/components/TabbarItem/TabbarItem'

interface MainProps {
	user: {
		id: number
		telegramId: number | undefined
		firstName: string | null
		lastName: string | null
		chatId: string | null
		username: string | null
		isMaster: boolean
		createdAt: Date
	} | null
}

const Main = ({ user }: MainProps) => {
	const { userPhoto, loading, error } = useTelegramUserProfile()
	const router = useRouter()

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.MainButton.hide()
		tg.BackButton.hide()
	}, [])

	if (!user) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<span className='text-lg font-medium'>
					<Spin size='large' />
				</span>
			</div>
		)
	}

	return (
		<>
			<Section className='pt-2 pb-2'>
				<Cell
					before={
						<Avatar src={userPhoto || '/placeholder-image.jpg'} size={48} />
					}
					after={<Image width={150} src='/logo.svg' alt='Логотип' />}
				>
					{user?.firstName}
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
					<a className='text-black' href='https://t.me/naznach'>
						Подписаться
					</a>
				</Button>
			</Banner>

			{/* Блок "Запись клиента" для мастеров */}
			{user?.isMaster && (
				<>
					<List
						style={{
							padding: 10,
						}}
					>
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
								onClick={() =>
									router.push(`/profile_zapis/${user?.telegramId}`)
								}
							>
								Записать
							</ButtonCell>
						</Section>
					</List>
				</>
			)}

			<List>
				<Section header='Основное меню'>
					{user?.isMaster && (
						<Cell
							before={
								<IconContainer>
									<FaCalendarAlt
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
							onClick={() => router.push(`/grafik/${user?.telegramId}`)}
						>
							Мой график
						</Cell>
					)}
					{user?.isMaster && (
						<Cell
							before={
								<IconContainer>
									<IoSettingsSharp
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
							onClick={() => router.push(`/profile/${user?.telegramId}`)}
						>
							Мой профиль
						</Cell>
					)}
					{user?.isMaster && (
						<Cell
							before={
								<IconContainer>
									<MdMenuBook
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
							onClick={() => router.push(`/my_booking/${user?.telegramId}`)}
						>
							Записи ко мне
						</Cell>
					)}
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
						onClick={() => router.push(`/my_specialist/${user?.telegramId}`)}
					>
						Мои специалисты
					</Cell>
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
						onClick={() => router.push(`/my_list/${user?.telegramId}`)}
					>
						Мои записи
					</Cell>
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
					</div>
				</FixedLayout>
			</List>
		</>
	)
}

export default Main
