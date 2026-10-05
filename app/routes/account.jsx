import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const fullName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Valued Customer'
    : 'Account Details';

  return (
    <div className="account-container">
      <div className="account-header">
        <h1 className="account-greeting">Welcome, {fullName}</h1>
        <AccountMenu />
      </div>
      <div className="account-content">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <nav className="account-nav" role="navigation" aria-label="Account navigation">
      <NavLink
        to="/account/orders"
        className={({isActive}) => `account-nav-link ${isActive ? 'is-active' : ''}`}
      >
        Orders
      </NavLink>
      <span className="account-nav-separator">|</span>
      <NavLink
        to="/account/profile"
        className={({isActive}) => `account-nav-link ${isActive ? 'is-active' : ''}`}
      >
        Profile
      </NavLink>
      <span className="account-nav-separator">|</span>
      <NavLink
        to="/account/addresses"
        className={({isActive}) => `account-nav-link ${isActive ? 'is-active' : ''}`}
      >
        Addresses
      </NavLink>
      <span className="account-nav-separator">|</span>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button type="submit" className="account-signout-btn">
        Sign out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
