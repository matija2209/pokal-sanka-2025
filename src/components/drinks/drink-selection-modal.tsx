'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getDrinksByCategory, getDrinkLabel, getDrinkPoints } from '@/lib/utils/drinks'

export default function DrinkSelectionModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tempSelection, setTempSelection] = useState(searchParams.get('drinkType') || '')
  const categories = getDrinksByCategory()

  useEffect(() => {
    setTempSelection(searchParams.get('drinkType') || '')
  }, [searchParams])

  const handleConfirm = () => {
    if (tempSelection) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('drinkType', tempSelection)
      router.push(`/app/quick-log?${params.toString()}`)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col px-4 py-4 sm:px-6">
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Hitri vpis</p>
              <h1 className="text-2xl font-bold">Izberi pijačo</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Nazaj
              </Button>
              <Button onClick={handleConfirm} disabled={!tempSelection}>
                Potrdi
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <RadioGroup value={tempSelection} onValueChange={setTempSelection}>
            {categories.map((category) => (
              <section key={category.name} className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <h2 className="font-bold text-lg">
                      {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.drinks.map((drink) => (
                    <label
                      key={drink.type}
                      htmlFor={drink.type}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
                    >
                      <RadioGroupItem value={drink.type} id={drink.type} />
                      <div className="flex flex-1 items-center justify-between gap-3">
                        <span className="font-medium">{drink.label}</span>
                        <span className="text-sm text-muted-foreground">
                          +{drink.points} {drink.points === 1 ? 'točka' : drink.points === 2 ? 'točki' : 'točke'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </RadioGroup>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-auto border-t bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Prekliči
            </Button>
            <Button onClick={handleConfirm} disabled={!tempSelection} className="flex-1">
              Potrdi izbor
            </Button>
          </div>
          {tempSelection && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Izbrano: {getDrinkLabel(tempSelection)} (+{getDrinkPoints(tempSelection)})
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
