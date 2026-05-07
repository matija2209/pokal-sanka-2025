'use client'

import { Trash2 } from 'lucide-react'
import { deleteCategoryAction } from '@/app/superadmin/trivia/actions'

type DeleteCategoryButtonProps = {
  categoryId: string
  categoryTitle: string
}

export function DeleteCategoryButton({ categoryId, categoryTitle }: DeleteCategoryButtonProps) {
  return (
    <form
      action={deleteCategoryAction.bind(null, categoryId)}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        if (!confirm(`Izbrisati kategorijo "${categoryTitle}"?`)) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="bg-destructive/15 hover:bg-destructive/25 active:bg-destructive/35 text-destructive border border-destructive/30 font-bold py-3 px-4 rounded-xl flex items-center gap-1 min-h-[48px]"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </form>
  )
}
