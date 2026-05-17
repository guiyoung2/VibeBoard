import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewContent } from '../ReviewContent'
import type { Review } from '../../types/review'

// 테스트용 리뷰 픽스처
const baseReview: Review = {
  id: 'r1',
  boardgame_id: 'bg-1',
  user_id: 'owner-id',
  rating: 4,
  content: '꽤 재밌는 게임입니다',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

// ReviewContent에 필요한 공통 props
function makeProps(overrides: Partial<Parameters<typeof ReviewContent>[0]> = {}) {
  return {
    review: baseReview,
    isEditing: false,
    editRating: 0,
    editContent: '',
    onEditRatingChange: vi.fn(),
    onEditContentChange: vi.fn(),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    currentUserId: undefined as string | undefined,
    isUpdatePending: false,
    isDeletePending: false,
    updateError: null,
    ...overrides,
  }
}

describe('ReviewContent — 권한 분기(isOwner)', () => {
  it('본인 리뷰일 때 수정·삭제 버튼이 표시된다', () => {
    render(<ReviewContent {...makeProps({ currentUserId: 'owner-id' })} />)
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('타인 리뷰일 때 수정·삭제 버튼이 표시되지 않는다', () => {
    render(<ReviewContent {...makeProps({ currentUserId: 'other-user-id' })} />)
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('비로그인 상태(currentUserId undefined)일 때 수정·삭제 버튼이 표시되지 않는다', () => {
    render(<ReviewContent {...makeProps({ currentUserId: undefined })} />)
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('리뷰 내용이 화면에 표시된다', () => {
    render(<ReviewContent {...makeProps({ currentUserId: undefined })} />)
    expect(screen.getByText('꽤 재밌는 게임입니다')).toBeInTheDocument()
  })
})
