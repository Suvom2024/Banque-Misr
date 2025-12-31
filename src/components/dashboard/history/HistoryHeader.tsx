'use client'

import { memo } from 'react'
import { BreadcrumbHeader } from '../BreadcrumbHeader'

interface HistoryHeaderProps {
    userName: string
    userRole?: string
    userAvatar?: string
}

function HistoryHeaderComponent({ userName, userRole, userAvatar }: HistoryHeaderProps) {
    return (
        <BreadcrumbHeader
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Session History' },
            ]}
            title="Training Session History"
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
        />
    )
}

export const HistoryHeader = memo(HistoryHeaderComponent)
