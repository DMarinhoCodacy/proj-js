// swift-tools-version:5.3
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "DispatchQueueFactory",
    platforms: [
        .macOS(.v10_13)
    ],
    products: [
        .library(
            name: "DispatchQueueFactory",
            targets: ["DispatchQueueFactory"]
        )
    ],
    targets: [
        .target(
            name: "DispatchQueueFactory",
            publicHeadersPath: "."
        )
    ]
)