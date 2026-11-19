import { Logo } from "@/components/icons/logo"
import { UserMenu } from "./userMenu"

function Header() {
  return (
    // sem usuário (login, primeiro cadastro...) a logo fica centralizada;
    // com o menu do usuário presente, logo à esquerda e avatar à direita
    // altura fixa (h-header): a lista de pacientes usa a tela menos o header
    <header className="bg-green-800 flex h-header shrink-0 items-center justify-center gap-4 px-3 md:px-6 has-[[data-user-menu]]:justify-between">
      {/* logo menor no celular para sobrar espaço para o avatar */}
      <Logo className="h-11 w-auto shrink-0 md:h-16" />
      <UserMenu />
    </header>
  )
}

export default Header
