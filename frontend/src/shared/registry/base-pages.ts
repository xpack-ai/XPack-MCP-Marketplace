import { pageRegistry } from "./page-registry";
import HomePage, { generateMetadata as HomePageMetadata } from "@/app/page";
import AboutPage, {
  generateMetadata as AboutPageMetadata,
} from "@/app/about/page";
import ConsolePage, {
  generateMetadata as ConsolePageMetadata,
} from "@/app/console/page";
import AdminLoginPage from "@/app/admin/page";
import AdminConsolePage, {
  generateMetadata as AdminConsolePageMetadata,
} from "@/app/admin/console/page";
import ProductPage, {
  generateMetadata as ProductPageMetadata,
} from "@/app/server/[id]/page";
import LoginPage from "@/app/signin/page";
import LoginSuccessPage from "@/app/loginSuccess/page";
import PaymentSuccessPage from "@/app/pay_success/page";

// Register base pages
export function registerBasePages() {
  // Register home page
  pageRegistry.registerBasePage("/", {
    component: HomePage,
    metadata: HomePageMetadata,
  });

  // Register about page
  pageRegistry.registerBasePage("/about", {
    component: AboutPage,
    metadata: AboutPageMetadata,
  });

  // Register console page
  pageRegistry.registerBasePage("/console", {
    component: ConsolePage,
    metadata: ConsolePageMetadata,
  });

  // Register admin login page
  pageRegistry.registerBasePage("/admin", {
    component: AdminLoginPage,
  });

  // Register admin console page
  pageRegistry.registerBasePage("/admin/console", {
    component: AdminConsolePage,
    metadata: AdminConsolePageMetadata,
  });

  // Register server detail page
  pageRegistry.registerBasePage("/server/[id]", {
    component: ProductPage,
    metadata: ProductPageMetadata,
  });
  //signup page
  pageRegistry.registerBasePage("/signin", {
    component: LoginPage,
    metadata: HomePageMetadata,
  });
  //login success page
  pageRegistry.registerBasePage("/loginSuccess", {
    component: LoginSuccessPage,
    metadata: HomePageMetadata,
  });
  //pay success page
  pageRegistry.registerBasePage("/pay_success", {
    component: PaymentSuccessPage,
    metadata: HomePageMetadata,
  });

  console.info("Base pages registered successfully");
}

// Auto-register pages when this module is imported
registerBasePages();
