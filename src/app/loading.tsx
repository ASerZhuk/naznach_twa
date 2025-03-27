'use client'

import { Spin } from 'antd'
import { AppRoot } from '@telegram-apps/telegram-ui'

export default function Loading() {
	return (
		<AppRoot>
			<div className='flex justify-center items-center h-screen'>
				<Spin size='large' />
			</div>
		</AppRoot>
	)
}
