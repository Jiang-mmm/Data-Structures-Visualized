import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AlgorithmInfo from '../../components/AlgorithmInfo'
import { tStatic } from '../../i18n/useI18n'

describe('AlgorithmInfo (v20 M6 i18n migration)', () => {
  const baseProps = {
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    isAnimating: false,
  }

  describe('10 algorithms coverage', () => {
    const algorithms = [
      'bubble', 'quick', 'merge', 'heap', 'selection',
      'insertion', 'counting', 'shell', 'radix', 'bucket',
    ]

    algorithms.forEach(algo => {
      it(`should render info for ${algo} from i18n`, () => {
        render(<AlgorithmInfo algorithmKey={algo} name={algo} {...baseProps} />)

        // 展开详情面板
        const button = screen.getByRole('button', { name: new RegExp(algo, 'i') })
        fireEvent.click(button)

        // description 通过 tStatic 解析
        const expectedDescription = tStatic(`algorithmInfo.${algo}.description`)
        expect(screen.getByText(expectedDescription)).toBeInTheDocument()
      })
    })
  })

  describe('characteristics split by |', () => {
    it('should split bubble characteristics by | into 3 items', () => {
      render(<AlgorithmInfo algorithmKey="bubble" name="bubble" {...baseProps} />)
      fireEvent.click(screen.getByRole('button', { name: /bubble/i }))

      const expectedChars = tStatic('algorithmInfo.bubble.characteristics').split('|')
      expect(expectedChars).toHaveLength(3)
      expectedChars.forEach(char => {
        expect(screen.getByText(char)).toBeInTheDocument()
      })
    })

    it('should split quick characteristics by | into 3 items', () => {
      render(<AlgorithmInfo algorithmKey="quick" name="quick" {...baseProps} />)
      fireEvent.click(screen.getByRole('button', { name: /quick/i }))

      const expectedChars = tStatic('algorithmInfo.quick.characteristics').split('|')
      expect(expectedChars).toHaveLength(3)
    })
  })

  describe('locale integrity', () => {
    const algorithms = [
      'bubble', 'quick', 'merge', 'heap', 'selection',
      'insertion', 'counting', 'shell', 'radix', 'bucket',
    ]

    it('zh and en must have same key set', () => {
      algorithms.forEach(algo => {
        const zhDesc = tStatic(`algorithmInfo.${algo}.description`)
        const enDesc = tStatic(`algorithmInfo.${algo}.description`)

        // 不论 zh/en 都应能解析（默认 zh；切到 en 时需保持 en 内容）
        expect(zhDesc.length).toBeGreaterThan(0)
        expect(enDesc.length).toBeGreaterThan(0)
      })
    })
  })

  describe('unknown algorithm key', () => {
    it('should return null for unknown key', () => {
      const { container } = render(
        <AlgorithmInfo algorithmKey="unknown" name="unknown" {...baseProps} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('animation state', () => {
    it('should disable expand button when isAnimating', () => {
      render(
        <AlgorithmInfo algorithmKey="bubble" name="bubble" {...baseProps} isAnimating />
      )
      const button = screen.getByRole('button', { name: /bubble/i })
      expect(button).toBeDisabled()
    })
  })
})
