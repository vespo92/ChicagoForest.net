/**
 * OpenWrt deployment support for Chicago Forest Network nodes.
 *
 * @module @chicago-forest/node-deploy/openwrt
 */

export {
  type ForestRouterConfig,
  type WireGuardPeer,
  type OpenWrtDeployOutput,
  generateOpenWrtDeploy,
} from './openwrt-deploy-config';

export {
  type OpenWrtTarget,
  type ImageBuilderConfig,
  OpenWrtImageBuilder,
} from './openwrt-image-builder';

export {
  type OpenWrtVersion,
  OPENWRT_23_05_5_PACKAGES,
  OPENWRT_24_10_5_PACKAGES,
  OPENWRT_BASE_PACKAGES,
  getPackagesForVersion,
} from './openwrt-package-list';
