import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const capacitorBuildGradle = path.join(rootDir, 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle');
const admobBuildGradle = path.join(rootDir, 'node_modules', '@capacitor-community', 'admob', 'android', 'build.gradle');

const classpathStrategy = `    configurations.classpath {
        resolutionStrategy {
            force 'io.netty:netty-codec-http2:4.1.139.Final'
            force 'io.netty:netty-codec-http:4.1.139.Final'
            force 'io.netty:netty-codec:4.1.139.Final'
            force 'io.netty:netty-handler-proxy:4.1.139.Final'
            force 'io.netty:netty-handler:4.1.139.Final'
            force 'io.netty:netty-transport-native-unix-common:4.1.139.Final'
            force 'io.netty:netty-codec-socks:4.1.139.Final'
            force 'io.netty:netty-common:4.1.139.Final'
            force 'io.netty:netty-buffer:4.1.139.Final'
            force 'io.netty:netty-transport:4.1.139.Final'
            force 'io.netty:netty-resolver:4.1.139.Final'
            force 'com.google.protobuf:protobuf-java:3.25.5'
            force 'com.google.guava:guava:33.7.2-jre'
            force 'org.jetbrains.kotlin:kotlin-stdlib:2.2.20'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:2.2.20'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:2.2.20'
            force 'org.jetbrains.kotlin:kotlin-stdlib-common:2.2.20'
        }
    }`;

const allConfigurationsStrategy = `configurations.all {
    resolutionStrategy {
        force 'io.netty:netty-codec-http2:4.1.139.Final'
        force 'io.netty:netty-codec-http:4.1.139.Final'
        force 'io.netty:netty-codec:4.1.139.Final'
        force 'io.netty:netty-handler-proxy:4.1.139.Final'
        force 'io.netty:netty-handler:4.1.139.Final'
        force 'io.netty:netty-transport-native-unix-common:4.1.139.Final'
        force 'io.netty:netty-codec-socks:4.1.139.Final'
        force 'io.netty:netty-common:4.1.139.Final'
        force 'io.netty:netty-buffer:4.1.139.Final'
        force 'io.netty:netty-transport:4.1.139.Final'
        force 'io.netty:netty-resolver:4.1.139.Final'
        force 'com.google.protobuf:protobuf-java:3.25.5'
        force 'com.google.guava:guava:33.7.2-jre'
        force 'org.bouncycastle:bcprov-jdk18on:1.86'
        force 'org.bouncycastle:bcpkix-jdk18on:1.86'
        force 'org.bouncycastle:bcutil-jdk18on:1.86'
        force 'org.bouncycastle:bcpg-jdk18on:1.86'
        force 'io.opentelemetry:opentelemetry-api:1.67.0'
        force 'io.opentelemetry:opentelemetry-context:1.67.0'
        force 'org.jetbrains.kotlin:kotlin-stdlib:2.2.20'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:2.2.20'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:2.2.20'
        force 'org.jetbrains.kotlin:kotlin-stdlib-common:2.2.20'
    }
}`;

function patchCapacitor() {
    if (!fs.existsSync(capacitorBuildGradle)) return;
    let content = fs.readFileSync(capacitorBuildGradle, 'utf8');
    if (!content.includes('io.netty:netty-codec-http2:4.1.139.Final')) {
        content = content.replace(
            /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/,
            `$1\n${classpathStrategy}\n`
        );
        fs.writeFileSync(capacitorBuildGradle, content, 'utf8');
        console.log('✓ Patched @capacitor/android build.gradle');
    }
}

function patchAdmob() {
    if (!fs.existsSync(admobBuildGradle)) return;
    let content = fs.readFileSync(admobBuildGradle, 'utf8');
    let modified = false;
    if (!content.includes('io.netty:netty-codec-http2:4.1.139.Final')) {
        content = content.replace(
            /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/,
            `$1\n${classpathStrategy}\n`
        );
        modified = true;
    }
    if (!content.includes(allConfigurationsStrategy)) {
        content = content.replace(
            /apply plugin: 'com.android.library'/,
            `${allConfigurationsStrategy}\n\napply plugin: 'com.android.library'`
        );
        modified = true;
    }
    if (modified) {
        fs.writeFileSync(admobBuildGradle, content, 'utf8');
        console.log('✓ Patched @capacitor-community/admob build.gradle');
    }
}

try {
    patchCapacitor();
    patchAdmob();
    console.log('Android security patches applied successfully.');
} catch (err) {
    console.error('Error applying Android security patches:', err);
}
