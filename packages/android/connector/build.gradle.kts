plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("maven-publish")
    id("signing")
}

android {
    namespace = "app.quiltt.connector"
    compileSdk = 33

    defaultConfig {
        // Support down to Android 8.0 (API level 26)
        minSdk = 26

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

publishing {
    publications {
        register<MavenPublication>("connector") {
            groupId = "app.quiltt"
            artifactId = "connector"
            version = "1.0.3"

            pom {
                name.set("Quiltt Connector")
                description.set("Quiltt Connector Android SDK")
                url.set("https://www.quiltt.dev/connector/sdk/android")

                organization {
                    name.set("Quiltt, Inc.")
                    url.set("https://www.quiltt.io/")
                }

                licenses {
                    license {
                        name.set("The MIT License (MIT)")
                        url.set("http://www.opensource.org/licenses/mit-license.php")
                    }
                }

                developers {
                    developer {
                        name.set("Quiltt, Inc.")
                        url.set("https://www.quiltt.io/")
                    }
                }

                scm {
                    connection.set("scm:git:github.com/quiltt/quiltt-android.git")
                    developerConnection.set("scm:git:ssh://github.com/quiltt/quiltt-android.git")
                    url.set("https://github.com/quiltt/quiltt-android/tree/main/connector")
                }
            }

            artifact("$buildDir/outputs/aar/connector-release.aar")
        } // app.quiltt:quiltt-connector:VERSION
    }
    repositories {
        maven {
            name = "OSSRH"
            url = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            credentials {
                username = System.getenv("OSSRH_USERNAME")
                password = System.getenv("OSSRH_PASSWORD")
            }
        }
    }
}

signing {
    useInMemoryPgpKeys(
        System.getenv("SIGNING_KEY_ID"),
        System.getenv("SIGNING_KEY"),
        System.getenv("SIGNING_PASSWORD"))
    sign(publishing.publications["connector"])
}