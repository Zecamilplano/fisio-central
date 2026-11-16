import { Logo } from "@/components/icons/logo"
import { UserMenu } from "./userMenu"

function Header() {
  return (
    <header className="bg-green-800 flex items-center justify-between gap-4 px-3 py-2 md:px-6">
      {/* logo menor no celular para sobrar espaço para o avatar */}
      <Logo className="h-11 w-auto shrink-0 md:h-16" />
      <UserMenu />
    </header>
  )
}

export default Header
