'use client'

import { useRouter, usePathname } from 'next/navigation'
import { FaHome, FaBook, FaUsers } from 'react-icons/fa'
import { MdMenuBook } from 'react-icons/md'

interface BottomNavProps {
	isMaster: boolean
	userId: string
}

const BottomNav = ({ isMaster, userId }: BottomNavProps) => {
	const router = useRouter()
	const pathname = usePathname()

	const isActive = (path: string) => {
		if (path === '/' && pathname === '/') return true
		if (path !== '/' && pathname.startsWith(path)) return true
		return false
	}

	const getIconColor = (path: string) => {
		return isActive(path) ? '#3b82f6' : '#9ca3af'
	}

	return (
		<div
			className='fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around'
			style={{ backgroundColor: '#2c2c2c', borderTop: '1px solid #404040' }}
		>
			<div
				className='flex flex-col items-center cursor-pointer'
				onClick={() => router.push('/')}
			>
				<FaHome size={24} color={getIconColor('/')} />
				<span className='text-xs mt-1' style={{ color: getIconColor('/') }}>
					Главная
				</span>
			</div>

			{isMaster && (
				<div
					className='flex flex-col items-center cursor-pointer'
					onClick={() => router.push(`/my_booking/${userId}`)}
				>
					<MdMenuBook size={24} color={getIconColor('/my_booking')} />
					<span
						className='text-xs mt-1'
						style={{ color: getIconColor('/my_booking') }}
					>
						Записи ко мне
					</span>
				</div>
			)}

			<div
				className='flex flex-col items-center cursor-pointer'
				onClick={() => router.push(`/my_list/${userId}`)}
			>
				<FaBook size={24} color={getIconColor('/my_list')} />
				<span
					className='text-xs mt-1'
					style={{ color: getIconColor('/my_list') }}
				>
					Мои записи
				</span>
			</div>

			<div
				className='flex flex-col items-center cursor-pointer'
				onClick={() => router.push(`/my_specialist/${userId}`)}
			>
				<FaUsers size={24} color={getIconColor('/my_specialist')} />
				<span
					className='text-xs mt-1'
					style={{ color: getIconColor('/my_specialist') }}
				>
					Мои специалисты
				</span>
			</div>
		</div>
	)
}

export default BottomNav
