import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {auth, init} from 'bfast';
import {getDaasAddress, getFaasAddress, UserService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router,
              private readonly userService: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise(async (resolve, reject) => {
      const user = await auth().currentUser();
      const shops = await this.userService.getShops(user);
      const shop = shops[0];
      if (user && user.role) {
        init({
          applicationId: shop.applicationId,
          projectId: shop.projectId,
          databaseURL: getDaasAddress(shop),
          functionsURL: getFaasAddress(shop)
        }, shop.projectId);
        resolve(true);
      } else {
        this.router.navigateByUrl('/login').catch();
        resolve(false);
      }
    });
  }

}
