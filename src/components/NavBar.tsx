import Link from 'next/link';
import { useUser } from '@/context/userContext';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { CombinedUserType } from '@/types';

const getNavLinks = (
  user: CombinedUserType | null,
  isLoadingUser: boolean
): { href: string; title: string }[] => {
  const links = [
    {
      href: '/',
      title: 'Home',
    },
    {
      href: '/pricing',
      title: 'Pricing',
    },
  ];

  if (user) {
    links.splice(2, 0, { href: '/dashboard', title: 'Dashboard' });
  }

  if (!isLoadingUser) {
    links.push({
      href: user ? '/logout' : '/login',
      title: user ? 'Logout' : 'Login',
    });
  }
  return links;
};

const NavBar: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoadingUser } = useUser();

  const links = getNavLinks(user, isLoadingUser);
  const isActive = (href: string) => pathname === href;

  return (
    <nav>
      <ul className="flex gap-5 py-4 px-6 border-b border-gray-200">
        {links.map(({ href, title }, index, array) => (
          <li
            key={title}
            className={classNames('hover:text-blue-700 p-1', {
              'text-blue-700': isActive(href),
              'ml-auto': index === array.length - 1 && !isLoadingUser,
            })}
          >
            <Link href={href}>{title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
