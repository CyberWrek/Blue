// map by your “userType” identifiers
window.MENU_CONFIG = {
  bluehq: {
    left: [
      { title: "Dashboard", href: "/shtml/bluehq/hq-dash.shtml" },
      { title: "Clients",   href: "/shtml/bluehq/clients.shtml" },
      { title: "Add User",  href: "/shtml/bluehq/new-user.shtml" }
    ],
    right: [
      { title: "Inbox",     href: "/shtml/bluehq/inbox.shtml" },
      { title: "Reminders", href: "/shtml/bluehq/reminders.shtml" }
    ]
  },
  homeowner: {
    left: [
      { title: "Home",      href: "/shtml/homeowner/home-dash.shtml" },
      { title: "Properties",href: "/shtml/homeowner/properties.shtml" }
    ],
    right: [
      { title: "Support",   href: "/shtml/homeowner/support.shtml" }
    ]
  },
  // …etc for each userType…
};