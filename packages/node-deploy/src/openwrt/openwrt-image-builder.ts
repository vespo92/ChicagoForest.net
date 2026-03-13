/**
 * OpenWrt Image Builder - Kubernetes Job generator.
 *
 * Generates a Kubernetes batch/v1 Job manifest that runs the OpenWrt
 * Image Builder inside a container to produce a custom firmware image
 * with Chicago Forest packages and configuration baked in.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { OpenWrtVersion } from './openwrt-package-list';
import { getPackagesForVersion } from './openwrt-package-list';

// =============================================================================
// TYPES
// =============================================================================

/**
 * OpenWrt target/subtarget combinations.
 *
 * Examples:
 *   - mediatek/filogic  (GL.iNet GL-MT6000, BananaPi BPi-R3/R4)
 *   - rockchip/armv8    (NanoPi R4S/R5S, FriendlyElec boards)
 *   - x86/64            (generic x86-64, VMs, Mini PCs)
 */
export type OpenWrtTarget = 'mediatek/filogic' | 'rockchip/armv8' | 'x86/64' | string;

/**
 * Configuration for the OpenWrt Image Builder job.
 */
export interface ImageBuilderConfig {
  /** OpenWrt target/subtarget (e.g., "mediatek/filogic") */
  target: OpenWrtTarget;
  /** Device profile name (e.g., "glinet_gl-mt6000") */
  profile: string;
  /** OpenWrt release version */
  version: OpenWrtVersion;
  /** Additional packages beyond the forest defaults (optional) */
  extraPackages?: string[];
  /** Packages to explicitly exclude (optional) */
  excludePackages?: string[];
  /** Custom files overlay directory in the PVC (optional) */
  filesDir?: string;
  /** Kubernetes namespace for the Job (default: chicago-forest) */
  namespace?: string;
  /** Container image override for the builder (optional) */
  builderImage?: string;
  /** PVC name for storing build artifacts (default: openwrt-builds) */
  artifactsPvc?: string;
  /** CPU limit for the build job (default: "4") */
  cpuLimit?: string;
  /** Memory limit for the build job (default: "4Gi") */
  memoryLimit?: string;
  /** Job TTL seconds after finished (default: 3600) */
  ttlSecondsAfterFinished?: number;
  /** Active deadline seconds (default: 1800 = 30 min) */
  activeDeadlineSeconds?: number;
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_NAMESPACE = 'chicago-forest';
const DEFAULT_ARTIFACTS_PVC = 'openwrt-builds';
const DEFAULT_CPU_LIMIT = '4';
const DEFAULT_MEMORY_LIMIT = '4Gi';
const DEFAULT_TTL = 3600;
const DEFAULT_DEADLINE = 1800;

// =============================================================================
// IMAGE BUILDER CLASS
// =============================================================================

/**
 * Generates Kubernetes Job manifests for building custom OpenWrt images.
 *
 * @example
 * ```typescript
 * const builder = new OpenWrtImageBuilder({
 *   target: 'mediatek/filogic',
 *   profile: 'glinet_gl-mt6000',
 *   version: '23.05.5',
 * });
 *
 * const jobYaml = builder.generateJobManifest();
 * ```
 */
export class OpenWrtImageBuilder {
  private readonly config: Required<
    Pick<ImageBuilderConfig, 'target' | 'profile' | 'version'>
  > &
    ImageBuilderConfig;

  constructor(config: ImageBuilderConfig) {
    if (!config.target) throw new Error('OpenWrt target is required');
    if (!config.profile) throw new Error('Device profile is required');
    if (!config.version) throw new Error('OpenWrt version is required');

    this.config = config;
  }

  /**
   * Get the full list of packages for this build.
   */
  getPackages(): string[] {
    const base = getPackagesForVersion(this.config.version);
    const extra = this.config.extraPackages ?? [];
    const exclude = new Set(this.config.excludePackages ?? []);

    return [...base, ...extra].filter((pkg) => !exclude.has(pkg));
  }

  /**
   * Get the Image Builder download URL for the configured version/target.
   */
  getImageBuilderUrl(): string {
    const { version, target } = this.config;
    const targetPath = target.replace('/', '-');
    return `https://downloads.openwrt.org/releases/${version}/targets/${target}/openwrt-imagebuilder-${version}-${targetPath}.Linux-x86_64.tar.xz`;
  }

  /**
   * Get the builder container image (default or override).
   */
  getBuilderImage(): string {
    return (
      this.config.builderImage ??
      'ghcr.io/chicago-forest/openwrt-imagebuilder:latest'
    );
  }

  /**
   * Generate a sanitised job name from config.
   */
  getJobName(): string {
    const profileSlug = this.config.profile
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    const ts = Date.now().toString(36);
    return `openwrt-build-${profileSlug}-${ts}`;
  }

  /**
   * Generate the complete Kubernetes batch/v1 Job manifest as YAML.
   */
  generateJobManifest(): string {
    const namespace = this.config.namespace ?? DEFAULT_NAMESPACE;
    const artifactsPvc = this.config.artifactsPvc ?? DEFAULT_ARTIFACTS_PVC;
    const cpuLimit = this.config.cpuLimit ?? DEFAULT_CPU_LIMIT;
    const memoryLimit = this.config.memoryLimit ?? DEFAULT_MEMORY_LIMIT;
    const ttl = this.config.ttlSecondsAfterFinished ?? DEFAULT_TTL;
    const deadline = this.config.activeDeadlineSeconds ?? DEFAULT_DEADLINE;

    const jobName = this.getJobName();
    const packages = this.getPackages();
    const imageBuilderUrl = this.getImageBuilderUrl();
    const builderImage = this.getBuilderImage();
    const targetSlash = this.config.target;
    const targetDash = targetSlash.replace('/', '-');
    const filesDir = this.config.filesDir ?? `/build/files`;
    const outputDir = `/artifacts/${this.config.profile}/${this.config.version}`;

    return `# Chicago Forest Network - OpenWrt Image Builder Job
# Target: ${targetSlash}  Profile: ${this.config.profile}  Version: ${this.config.version}
# DISCLAIMER: Theoretical framework - not operational
apiVersion: batch/v1
kind: Job
metadata:
  name: ${jobName}
  namespace: ${namespace}
  labels:
    app: openwrt-image-builder
    forest.network/component: image-builder
    forest.network/target: "${targetDash}"
    forest.network/profile: "${this.config.profile}"
    forest.network/openwrt-version: "${this.config.version}"
spec:
  ttlSecondsAfterFinished: ${ttl}
  activeDeadlineSeconds: ${deadline}
  backoffLimit: 2
  template:
    metadata:
      labels:
        app: openwrt-image-builder
        forest.network/component: image-builder
    spec:
      restartPolicy: Never
      containers:
        - name: image-builder
          image: ${builderImage}
          imagePullPolicy: IfNotPresent
          command:
            - /bin/bash
            - -ce
            - |
              set -euo pipefail

              echo "=== Chicago Forest OpenWrt Image Builder ==="
              echo "Target:  ${targetSlash}"
              echo "Profile: ${this.config.profile}"
              echo "Version: ${this.config.version}"
              echo "=========================================="

              # Download and extract Image Builder
              cd /build
              echo "[1/4] Downloading Image Builder..."
              curl -fSL "${imageBuilderUrl}" -o imagebuilder.tar.xz
              tar xf imagebuilder.tar.xz --strip-components=1
              rm imagebuilder.tar.xz

              # Prepare custom files overlay
              echo "[2/4] Preparing files overlay..."
              mkdir -p ${filesDir}
              if [ -d /overlay-files ]; then
                cp -a /overlay-files/* ${filesDir}/
              fi

              # Build the image
              echo "[3/4] Building image with packages..."
              make image \\
                PROFILE="${this.config.profile}" \\
                PACKAGES="${packages.join(' ')}" \\
                FILES="${filesDir}" \\
                BIN_DIR="/build/output"

              # Copy artifacts
              echo "[4/4] Copying artifacts to ${outputDir}..."
              mkdir -p ${outputDir}
              cp -a /build/output/* ${outputDir}/

              echo "=== Build complete ==="
              ls -lh ${outputDir}/

          resources:
            limits:
              cpu: "${cpuLimit}"
              memory: "${memoryLimit}"
            requests:
              cpu: "1"
              memory: "2Gi"

          volumeMounts:
            - name: build-workspace
              mountPath: /build
            - name: artifacts
              mountPath: /artifacts
            - name: overlay-files
              mountPath: /overlay-files
              readOnly: true

      volumes:
        - name: build-workspace
          emptyDir:
            sizeLimit: 10Gi
        - name: artifacts
          persistentVolumeClaim:
            claimName: ${artifactsPvc}
        - name: overlay-files
          configMap:
            name: ${jobName}-files
            optional: true
`;
  }

  /**
   * Generate a summary of the build configuration.
   */
  getSummary(): string {
    const packages = this.getPackages();
    return [
      `OpenWrt Image Builder Configuration`,
      `  Target:   ${this.config.target}`,
      `  Profile:  ${this.config.profile}`,
      `  Version:  ${this.config.version}`,
      `  Packages: ${packages.length} total`,
      `  URL:      ${this.getImageBuilderUrl()}`,
    ].join('\n');
  }
}
